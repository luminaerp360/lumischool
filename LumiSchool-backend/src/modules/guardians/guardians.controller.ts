import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { GuardiansService } from "./guardians.service";
import {
  CreateGuardianDto,
  UpdateGuardianDto,
  GuardianQueryDto,
  LinkStudentDto,
} from "./dto/guardian.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { Role } from "../../common/enums/roles.enum";

@ApiTags("Guardians")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("guardians")
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create a new guardian/parent" })
  create(@TenantId() tenantId: string, @Body() dto: CreateGuardianDto) {
    return this.guardiansService.create(tenantId, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "List guardians with filters & pagination" })
  findAll(@TenantId() tenantId: string, @Query() query: GuardianQueryDto) {
    return this.guardiansService.findAll(tenantId, query);
  }

  @Get("student/:studentId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get guardians for a specific student" })
  findByStudent(
    @TenantId() tenantId: string,
    @Param("studentId") studentId: string,
  ) {
    return this.guardiansService.findByStudent(tenantId, studentId);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Get guardian by ID" })
  findById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.guardiansService.findById(id, tenantId);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update guardian details" })
  update(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardiansService.update(id, tenantId, dto);
  }

  @Post(":id/link-student")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Link a student to this guardian" })
  linkStudent(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: LinkStudentDto,
  ) {
    return this.guardiansService.linkStudent(id, tenantId, dto);
  }

  @Delete(":id/unlink-student/:studentId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Unlink a student from this guardian" })
  unlinkStudent(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Param("studentId") studentId: string,
  ) {
    return this.guardiansService.unlinkStudent(id, tenantId, studentId);
  }
}
