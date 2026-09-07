import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { MpesaService } from "./mpesa.service";
import {
  StkPushDto,
  MpesaCallbackDto,
  C2BConfirmationDto,
} from "./dto/mpesa.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import { TenantId } from "../../../common/decorators/tenant.decorator";
import { Role } from "../../../common/enums/roles.enum";

@ApiTags("MPESA")
@Controller("integrations/mpesa")
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post("stk-push")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR, Role.PARENT)
  @ApiOperation({ summary: "Initiate MPESA STK Push payment" })
  stkPush(@TenantId() tenantId: string, @Body() dto: StkPushDto) {
    return this.mpesaService.initiateStkPush(tenantId, dto);
  }

  @Post("callback")
  @Public()
  @ApiOperation({ summary: "MPESA STK Push callback (called by Safaricom)" })
  stkCallback(@Body() dto: MpesaCallbackDto) {
    return this.mpesaService.handleStkCallback(dto);
  }

  @Post("c2b/validation")
  @Public()
  @ApiOperation({ summary: "C2B validation URL" })
  c2bValidation() {
    // Accept all C2B transactions
    return { ResultCode: 0, ResultDesc: "Accepted" };
  }

  @Post("c2b/confirmation")
  @Public()
  @ApiOperation({ summary: "C2B confirmation URL (called by Safaricom)" })
  c2bConfirmation(@Body() dto: C2BConfirmationDto) {
    // TODO: Determine tenantId from shortcode or account reference
    // For now, this needs to be handled via shortcode mapping
    return { ResultCode: 0, ResultDesc: "Confirmation received" };
  }

  @Get("status")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR, Role.PARENT)
  @ApiOperation({ summary: "Check MPESA transaction status" })
  checkStatus(
    @TenantId() tenantId: string,
    @Query("checkoutRequestId") checkoutRequestId: string,
  ) {
    return this.mpesaService.getTransactionStatus(tenantId, checkoutRequestId);
  }
}
