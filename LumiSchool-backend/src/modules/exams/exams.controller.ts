import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ExamsService } from "./exams.service";
import {
  CreateExamDto,
  UpdateExamDto,
  ExamQueryDto,
  SubmitResultsDto,
  ResultQueryDto,
} from "./dto/exam.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../common/enums/roles.enum";
import { Types } from "mongoose";

@ApiTags("Exams & Assessments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("exams")
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // ── Exam CRUD ──

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create a new exam" })
  create(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Body() dto: CreateExamDto,
  ) {
    return this.examsService.createExam(tenantId, userId, dto);
  }

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.BURSAR,
  )
  @ApiOperation({ summary: "List all exams" })
  findAll(@TenantId() tenantId: Types.ObjectId, @Query() query: ExamQueryDto) {
    return this.examsService.findAllExams(tenantId, query);
  }

  @Get(":id")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.BURSAR,
  )
  @ApiOperation({ summary: "Get exam by ID" })
  findOne(@TenantId() tenantId: Types.ObjectId, @Param("id") id: string) {
    return this.examsService.findExamById(tenantId, id);
  }

  @Put(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update exam" })
  update(
    @TenantId() tenantId: Types.ObjectId,
    @Param("id") id: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examsService.updateExam(tenantId, id, dto);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Deactivate exam" })
  remove(@TenantId() tenantId: Types.ObjectId, @Param("id") id: string) {
    return this.examsService.deleteExam(tenantId, id);
  }

  @Patch(":id/publish")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Publish exam results" })
  publish(@TenantId() tenantId: Types.ObjectId, @Param("id") id: string) {
    return this.examsService.publishExam(tenantId, id);
  }

  // ── Results ──

  @Post("results")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Submit exam results (bulk)" })
  submitResults(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Body() dto: SubmitResultsDto,
  ) {
    return this.examsService.submitResults(tenantId, userId, dto);
  }

  @Get("results/list")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.BURSAR,
  )
  @ApiOperation({ summary: "Query exam results" })
  findResults(
    @TenantId() tenantId: Types.ObjectId,
    @Query() query: ResultQueryDto,
  ) {
    return this.examsService.findResults(tenantId, query);
  }

  @Get("results/student/:studentId")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.PARENT,
    Role.STUDENT,
  )
  @ApiOperation({ summary: "Get student results" })
  getStudentResults(
    @TenantId() tenantId: Types.ObjectId,
    @Param("studentId") studentId: string,
    @Query("examId") examId?: string,
  ) {
    return this.examsService.getStudentResults(tenantId, studentId, examId);
  }

  @Get("results/class/:examId/:classId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get class results for an exam" })
  getClassResults(
    @TenantId() tenantId: Types.ObjectId,
    @Param("examId") examId: string,
    @Param("classId") classId: string,
  ) {
    return this.examsService.getClassResults(tenantId, examId, classId);
  }

  @Get("results/ranking/:examId/:classId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get class ranking for an exam" })
  getClassRanking(
    @TenantId() tenantId: Types.ObjectId,
    @Param("examId") examId: string,
    @Param("classId") classId: string,
  ) {
    return this.examsService.getClassRanking(tenantId, examId, classId);
  }

  @Get("results/analysis/:examId/:subjectId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get subject analysis for an exam" })
  getSubjectAnalysis(
    @TenantId() tenantId: Types.ObjectId,
    @Param("examId") examId: string,
    @Param("subjectId") subjectId: string,
  ) {
    return this.examsService.getSubjectAnalysis(tenantId, examId, subjectId);
  }
}
