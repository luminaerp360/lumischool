import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { GenerateReportDto, ReportQueryDto } from "./dto/report.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../common/enums/roles.enum";
import { Types } from "mongoose";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post("generate")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Generate a report" })
  generate(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Body() dto: GenerateReportDto,
  ) {
    return this.reportsService.generateReport(tenantId, userId, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "List generated reports" })
  findAll(
    @TenantId() tenantId: Types.ObjectId,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.findAll(tenantId, query);
  }

  @Get("dashboard")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Get dashboard stats" })
  getDashboard(@TenantId() tenantId: Types.ObjectId) {
    return this.reportsService.getDashboardStats(tenantId);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Get report by ID" })
  findOne(@TenantId() tenantId: Types.ObjectId, @Param("id") id: string) {
    return this.reportsService.findById(tenantId, id);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Delete a report" })
  remove(@TenantId() tenantId: Types.ObjectId, @Param("id") id: string) {
    return this.reportsService.deleteReport(tenantId, id);
  }
}
