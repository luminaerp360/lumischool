import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { FinanceService } from "./finance.service";
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  GenerateInvoicesDto,
  ApplyDiscountDto,
  InvoiceQueryDto,
  RecordPaymentDto,
  PaymentQueryDto,
} from "./dto/finance.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { Role } from "../../common/enums/roles.enum";

@ApiTags("Finance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ---- Fee Structures ----
  @Post("fee-structures")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR)
  @ApiOperation({ summary: "Create a fee structure" })
  createFeeStructure(
    @TenantId() tenantId: string,
    @Body() dto: CreateFeeStructureDto,
  ) {
    return this.financeService.createFeeStructure(tenantId, dto);
  }

  @Get("fee-structures")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "List all fee structures" })
  findAllFeeStructures(@TenantId() tenantId: string, @Query() query: any) {
    return this.financeService.findAllFeeStructures(tenantId, query);
  }

  @Patch("fee-structures/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR)
  @ApiOperation({ summary: "Update a fee structure" })
  updateFeeStructure(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateFeeStructureDto,
  ) {
    return this.financeService.updateFeeStructure(id, tenantId, dto);
  }

  // ---- Invoices ----
  @Post("invoices/generate")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR)
  @ApiOperation({ summary: "Generate fee invoices for students" })
  generateInvoices(
    @TenantId() tenantId: string,
    @Body() dto: GenerateInvoicesDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.financeService.generateInvoices(tenantId, dto, userId);
  }

  @Get("invoices")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.BURSAR,
    Role.PARENT,
  )
  @ApiOperation({ summary: "List invoices with filters" })
  findAllInvoices(
    @TenantId() tenantId: string,
    @Query() query: InvoiceQueryDto,
  ) {
    return this.financeService.findAllInvoices(tenantId, query);
  }

  @Get("invoices/:id")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.BURSAR,
    Role.PARENT,
  )
  @ApiOperation({ summary: "Get invoice by ID" })
  findInvoiceById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.financeService.findInvoiceById(id, tenantId);
  }

  @Patch("invoices/:id/discount")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR)
  @ApiOperation({ summary: "Apply discount to an invoice" })
  applyDiscount(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: ApplyDiscountDto,
  ) {
    return this.financeService.applyDiscount(id, tenantId, dto);
  }

  // ---- Payments ----
  @Post("payments")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.BURSAR)
  @ApiOperation({ summary: "Record a fee payment" })
  recordPayment(
    @TenantId() tenantId: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.financeService.recordPayment(tenantId, dto, userId);
  }

  @Get("payments")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "List payments with filters" })
  findAllPayments(
    @TenantId() tenantId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.financeService.findAllPayments(tenantId, query);
  }

  // ---- Summary ----
  @Get("summary")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Get finance summary (collections, balances)" })
  getFinanceSummary(@TenantId() tenantId: string) {
    return this.financeService.getFinanceSummary(tenantId);
  }
}
