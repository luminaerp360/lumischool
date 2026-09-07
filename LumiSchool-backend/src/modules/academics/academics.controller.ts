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
import { AcademicsService } from "./academics.service";
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectQueryDto,
  CreateSubjectAssignmentDto,
  UpdateSubjectAssignmentDto,
} from "./dto/academic.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { Role } from "../../common/enums/roles.enum";

@ApiTags("Academics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("academics")
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  // ---- Subjects ----
  @Post("subjects")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create a new subject" })
  createSubject(@TenantId() tenantId: string, @Body() dto: CreateSubjectDto) {
    return this.academicsService.createSubject(tenantId, dto);
  }

  @Get("subjects")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "List all subjects" })
  findAllSubjects(
    @TenantId() tenantId: string,
    @Query() query: SubjectQueryDto,
  ) {
    return this.academicsService.findAllSubjects(tenantId, query);
  }

  @Get("subjects/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get subject by ID" })
  findSubjectById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.academicsService.findSubjectById(id, tenantId);
  }

  @Patch("subjects/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update a subject" })
  updateSubject(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.academicsService.updateSubject(id, tenantId, dto);
  }

  // ---- Assignments ----
  @Get("assignments")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({
    summary: "List all subject assignments with optional filters",
  })
  findAllAssignments(
    @TenantId() tenantId: string,
    @Query("classId") classId?: string,
    @Query("teacherId") teacherId?: string,
    @Query("academicYear") academicYear?: string,
  ) {
    return this.academicsService.findAllAssignments(tenantId, {
      classId,
      teacherId,
      academicYear,
    });
  }

  @Post("assignments")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Assign a subject to a teacher for a class" })
  createAssignment(
    @TenantId() tenantId: string,
    @Body() dto: CreateSubjectAssignmentDto,
  ) {
    return this.academicsService.createAssignment(tenantId, dto);
  }

  @Get("assignments/class/:classId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get all subject assignments for a class" })
  findAssignmentsByClass(
    @TenantId() tenantId: string,
    @Param("classId") classId: string,
    @Query("academicYear") academicYear: string,
  ) {
    return this.academicsService.findAssignmentsByClass(
      tenantId,
      classId,
      academicYear,
    );
  }

  @Get("assignments/teacher/:teacherId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get all subject assignments for a teacher" })
  findAssignmentsByTeacher(
    @TenantId() tenantId: string,
    @Param("teacherId") teacherId: string,
    @Query("academicYear") academicYear: string,
  ) {
    return this.academicsService.findAssignmentsByTeacher(
      tenantId,
      teacherId,
      academicYear,
    );
  }

  @Patch("assignments/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update a subject assignment" })
  updateAssignment(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateSubjectAssignmentDto,
  ) {
    return this.academicsService.updateAssignment(id, tenantId, dto);
  }

  @Delete("assignments/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Deactivate a subject assignment" })
  deleteAssignment(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.academicsService.deleteAssignment(id, tenantId);
  }
}
