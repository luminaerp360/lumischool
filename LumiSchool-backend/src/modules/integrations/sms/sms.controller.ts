import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SmsService } from "./sms.service";
import { SendSmsDto, SmsQueryDto } from "./dto/sms.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { TenantId } from "../../../common/decorators/tenant.decorator";
import { Role } from "../../../common/enums/roles.enum";

@ApiTags("SMS")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("integrations/sms")
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post("send")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Send SMS to one or more phone numbers" })
  send(
    @TenantId() tenantId: string,
    @Body() dto: SendSmsDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.smsService.sendSms(tenantId, dto, userId);
  }

  @Get("logs")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "View SMS send history" })
  findAll(@TenantId() tenantId: string, @Query() query: SmsQueryDto) {
    return this.smsService.findAll(tenantId, query);
  }

  @Get("balance")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: "Check Africa's Talking SMS credit balance" })
  getBalance() {
    return this.smsService.getSmsBalance();
  }
}
