import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { AuditQueryDto } from "./dto/audit.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { Role } from "../../common/enums/roles.enum";
import { Types } from "mongoose";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "List audit logs" })
  findAll(@TenantId() tenantId: Types.ObjectId, @Query() query: AuditQueryDto) {
    return this.auditService.findAll(tenantId, query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Get audit log by ID" })
  findOne(@TenantId() tenantId: Types.ObjectId, @Param("id") id: string) {
    return this.auditService.findById(tenantId, id);
  }
}
