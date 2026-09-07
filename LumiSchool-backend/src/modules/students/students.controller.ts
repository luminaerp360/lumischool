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
import { StudentsService } from "./students.service";
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQueryDto,
  PromoteStudentsDto,
  TransferStudentDto,
  BulkImportStudentDto,
} from "./dto/student.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../common/enums/roles.enum";
import { SchoolLevel } from "../../common/enums/school-level.enum";

@ApiTags("Students")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Register a new student" })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateStudentDto,
    @CurrentUser() user?: any,
  ) {
    return this.studentsService.create(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.BURSAR,
  )
  @ApiOperation({ summary: "List students with filters & pagination" })
  findAll(@TenantId() tenantId: string, @Query() query: StudentQueryDto) {
    return this.studentsService.findAll(tenantId, query);
  }

  @Get("stats")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Get detailed student statistics" })
  getStats(@TenantId() tenantId: string) {
    return this.studentsService.getStats(tenantId);
  }

  @Get("class/:classId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get all students in a class" })
  findByClass(@TenantId() tenantId: string, @Param("classId") classId: string) {
    return this.studentsService.findByClass(tenantId, classId);
  }

  @Get("guardian/:guardianId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.PARENT)
  @ApiOperation({ summary: "Get students for a guardian" })
  findByGuardian(
    @TenantId() tenantId: string,
    @Param("guardianId") guardianId: string,
  ) {
    return this.studentsService.findByGuardian(tenantId, guardianId);
  }

  @Get(":id")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.BURSAR,
    Role.PARENT,
  )
  @ApiOperation({ summary: "Get student by ID" })
  findById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.studentsService.findById(id, tenantId);
  }

  @Get(":id/promotion-history")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Get promotion history for a student" })
  getPromotionHistory(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.studentsService.getPromotionHistory(id, tenantId);
  }

  @Patch("promote")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Bulk promote students to next grade/level" })
  promote(
    @TenantId() tenantId: string,
    @Body() dto: PromoteStudentsDto,
    @CurrentUser() user?: any,
  ) {
    return this.studentsService.promoteStudents(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Post("auto-promote/:level")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Auto-promote all active students in a level" })
  autoPromote(
    @TenantId() tenantId: string,
    @Param("level") level: SchoolLevel,
    @Query("academicYear") academicYear: string,
    @CurrentUser() user?: any,
  ) {
    if (!academicYear) {
      return { success: false, message: "academicYear query parameter is required" };
    }
    return this.studentsService.autoPromoteByLevel(
      tenantId,
      level,
      academicYear,
      user?.userId,
      user?.email,
    );
  }

  @Post("bulk-import")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Bulk import students from CSV/array" })
  bulkImport(
    @TenantId() tenantId: string,
    @Body() dto: BulkImportStudentDto,
    @CurrentUser() user?: any,
  ) {
    return this.studentsService.bulkImport(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Patch(":id/transfer")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Transfer a student to another school" })
  transfer(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: TransferStudentDto,
    @CurrentUser() user?: any,
  ) {
    return this.studentsService.transferStudent(
      id,
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update student details" })
  update(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user?: any,
  ) {
    return this.studentsService.update(
      id,
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Archive (soft delete) a student" })
  archive(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user?: any,
  ) {
    return this.studentsService.archiveStudent(
      id,
      tenantId,
      user?.userId,
      user?.email,
    );
  }
}
