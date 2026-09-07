import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  MpesaTransaction,
  MpesaTransactionDocument,
  MpesaTransactionType,
  MpesaTransactionStatus,
} from "./schemas/mpesa-transaction.schema";
import {
  StkPushDto,
  MpesaCallbackDto,
  C2BConfirmationDto,
} from "./dto/mpesa.dto";
import { ApiResponse } from "../../../common/dto/api-response.dto";
import { normalizeKenyanPhone } from "../../../common/utils/phone.util";

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly shortcode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;
  private readonly environment: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(MpesaTransaction.name)
    private readonly transactionModel: Model<MpesaTransactionDocument>,
  ) {
    this.consumerKey = this.configService.get<string>("MPESA_CONSUMER_KEY");
    this.consumerSecret = this.configService.get<string>(
      "MPESA_CONSUMER_SECRET",
    );
    this.shortcode = this.configService.get<string>("MPESA_SHORTCODE");
    this.passkey = this.configService.get<string>("MPESA_PASSKEY");
    this.callbackUrl = this.configService.get<string>("MPESA_CALLBACK_URL");
    this.environment = this.configService.get<string>(
      "MPESA_ENVIRONMENT",
      "sandbox",
    );
  }

  private get baseUrl(): string {
    return this.environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${auth}` },
      },
    );

    const data = await response.json();
    return data.access_token;
  }

  async initiateStkPush(
    tenantId: string,
    dto: StkPushDto,
  ): Promise<ApiResponse<any>> {
    const phone = normalizeKenyanPhone(dto.phoneNumber);
    if (!phone) {
      throw new BadRequestException("Invalid phone number format");
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:Z.]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`,
    ).toString("base64");

    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(dto.amount),
          PartyA: phone,
          PartyB: this.shortcode,
          PhoneNumber: phone,
          CallBackURL: `${this.callbackUrl}/integrations/mpesa/callback`,
          AccountReference: dto.accountReference || dto.invoiceId,
          TransactionDesc: dto.transactionDesc || "School Fee Payment",
        }),
      },
    );

    const result = await response.json();

    if (result.ResponseCode === "0") {
      // Save pending transaction
      await this.transactionModel.create({
        tenantId: tenantId as any,
        type: MpesaTransactionType.STK_PUSH,
        merchantRequestId: result.MerchantRequestID,
        checkoutRequestId: result.CheckoutRequestID,
        phoneNumber: phone,
        amount: dto.amount,
        status: MpesaTransactionStatus.PENDING,
        invoiceId: dto.invoiceId as any,
        accountReference: dto.accountReference || dto.invoiceId,
      });

      return ApiResponse.success(
        {
          checkoutRequestId: result.CheckoutRequestID,
          merchantRequestId: result.MerchantRequestID,
        },
        "STK Push initiated. Check your phone.",
      );
    }

    throw new BadRequestException(
      result.errorMessage || "Failed to initiate MPESA payment",
    );
  }

  async handleStkCallback(callback: MpesaCallbackDto): Promise<void> {
    const { stkCallback } = callback.Body;
    this.logger.log(`STK Callback: ${JSON.stringify(stkCallback)}`);

    const transaction = await this.transactionModel.findOne({
      checkoutRequestId: stkCallback.CheckoutRequestID,
    });

    if (!transaction) {
      this.logger.warn(
        `Transaction not found for CheckoutRequestID: ${stkCallback.CheckoutRequestID}`,
      );
      return;
    }

    transaction.resultCode = stkCallback.ResultCode;
    transaction.resultDesc = stkCallback.ResultDesc;
    transaction.rawCallback = stkCallback;

    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
      transaction.status = MpesaTransactionStatus.COMPLETED;

      const metadata = stkCallback.CallbackMetadata.Item;
      const receipt = metadata.find((m) => m.Name === "MpesaReceiptNumber");
      if (receipt) {
        transaction.mpesaReceiptNumber = receipt.Value as string;
      }

      // TODO: Trigger payment recording via event emitter
      // this.eventEmitter.emit('mpesa.payment.completed', { transaction });
    } else {
      transaction.status = MpesaTransactionStatus.FAILED;
    }

    await transaction.save();
  }

  async handleC2BConfirmation(
    tenantId: string,
    dto: C2BConfirmationDto,
  ): Promise<void> {
    this.logger.log(`C2B Confirmation: ${JSON.stringify(dto)}`);

    await this.transactionModel.create({
      tenantId: tenantId as any,
      type: MpesaTransactionType.C2B,
      mpesaReceiptNumber: dto.TransID,
      phoneNumber: dto.MSISDN,
      amount: parseFloat(dto.TransAmount),
      status: MpesaTransactionStatus.COMPLETED,
      accountReference: dto.BillRefNumber,
      rawCallback: dto,
    });

    // TODO: Auto-match to invoice using BillRefNumber (admission number or invoice number)
  }

  async getTransactionStatus(
    tenantId: string,
    checkoutRequestId: string,
  ): Promise<ApiResponse<MpesaTransactionDocument>> {
    const transaction = await this.transactionModel.findOne({
      tenantId,
      checkoutRequestId,
    });

    if (!transaction) {
      throw new BadRequestException("Transaction not found");
    }

    return ApiResponse.success(transaction, "Transaction status retrieved");
  }
}
