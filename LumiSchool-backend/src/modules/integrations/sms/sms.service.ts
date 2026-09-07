import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  SmsLog,
  SmsLogDocument,
  SmsStatus,
  SmsCategory,
} from "./schemas/sms-log.schema";
import { SendSmsDto, SendBulkSmsDto, SmsQueryDto } from "./dto/sms.dto";
import { ApiResponse } from "../../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../../common/utils/pagination.util";
import { normalizeKenyanPhone } from "../../../common/utils/phone.util";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly username: string;
  private readonly senderId: string;
  private africastalking: any;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SmsLog.name)
    private readonly smsLogModel: Model<SmsLogDocument>,
  ) {
    this.apiKey = this.configService.get<string>("AT_API_KEY");
    this.username = this.configService.get<string>("AT_USERNAME");
    this.senderId = this.configService.get<string>("AT_SENDER_ID", "");

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AfricasTalking = require("africastalking");
      this.africastalking = AfricasTalking({
        apiKey: this.apiKey,
        username: this.username,
      });
    } catch {
      this.logger.warn("Africa's Talking SDK not available");
    }
  }

  async sendSms(
    tenantId: string,
    dto: SendSmsDto,
    sentById?: string,
  ): Promise<ApiResponse<{ sent: number; failed: number }>> {
    let sent = 0;
    let failed = 0;

    for (const phone of dto.phoneNumbers) {
      const normalizedPhone = normalizeKenyanPhone(phone);
      if (!normalizedPhone) {
        failed++;
        continue;
      }

      try {
        let externalId: string;
        let cost: string;

        if (this.africastalking) {
          const sms = this.africastalking.SMS;
          const options: any = {
            to: [`+${normalizedPhone}`],
            message: dto.message,
          };
          if (this.senderId) options.from = this.senderId;

          const result = await sms.send(options);
          const recipient = result.SMSMessageData?.Recipients?.[0];
          externalId = recipient?.messageId;
          cost = recipient?.cost;
        } else {
          this.logger.log(
            `[DRY RUN] SMS to ${normalizedPhone}: ${dto.message}`,
          );
          externalId = `dry-run-${Date.now()}`;
        }

        await this.smsLogModel.create({
          tenantId: tenantId as any,
          phoneNumber: normalizedPhone,
          message: dto.message,
          status: SmsStatus.SENT,
          category: dto.category || SmsCategory.GENERAL,
          externalId,
          cost,
          sentById: sentById as any,
        });

        sent++;
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${phone}`, error.stack);

        await this.smsLogModel.create({
          tenantId: tenantId as any,
          phoneNumber: normalizedPhone || phone,
          message: dto.message,
          status: SmsStatus.FAILED,
          category: dto.category || SmsCategory.GENERAL,
          errorMessage: error.message,
          sentById: sentById as any,
        });

        failed++;
      }
    }

    return ApiResponse.success(
      { sent, failed },
      `SMS sent: ${sent}, failed: ${failed}`,
    );
  }

  async findAll(
    tenantId: string,
    query: SmsQueryDto,
  ): Promise<ApiResponse<SmsLogDocument[]>> {
    const filter: FilterQuery<SmsLogDocument> = { tenantId };

    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { phoneNumber: { $regex: query.search, $options: "i" } },
        { message: { $regex: query.search, $options: "i" } },
      ];
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.smsLogModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.smsLogModel.countDocuments(filter).exec(),
    ]);
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "SMS logs retrieved", meta);
  }

  async getSmsBalance(): Promise<ApiResponse<any>> {
    if (!this.africastalking) {
      return ApiResponse.success(
        { balance: "N/A (dry run mode)" },
        "SMS balance",
      );
    }

    try {
      const application = this.africastalking.APPLICATION;
      const result = await application.fetchApplicationData();
      return ApiResponse.success(
        { balance: result.UserData?.balance },
        "SMS balance retrieved",
      );
    } catch (error) {
      this.logger.error("Failed to fetch SMS balance", error.stack);
      return ApiResponse.error("Failed to fetch SMS balance");
    }
  }
}
