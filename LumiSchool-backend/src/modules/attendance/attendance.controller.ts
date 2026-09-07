import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AttendanceService } from "./attendance.service";
import {
  MarkAttendanceDto,
  AttendanceQueryDto,
  SyncAttendanceDto,
} from "./dto/attendance.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { Role } from "../../common/enums/roles.enum";

@ApiTags("Attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Mark attendance for a class (bulk)" })
  markAttendance(
    @TenantId() tenantId: string,
    @Body() dto: MarkAttendanceDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.attendanceService.markAttendance(tenantId, dto, userId);
  }

  @Post("sync")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Sync offline attendance records" })
  syncOffline(
    @TenantId() tenantId: string,
    @Body() dto: SyncAttendanceDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.attendanceService.syncOfflineAttendance(tenantId, dto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Query attendance records with filters" })
  findAll(@TenantId() tenantId: string, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(tenantId, query);
  }

  @Get("class/:classId")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get attendance for a class on a specific date" })
  getClassAttendance(
    @TenantId() tenantId: string,
    @Param("classId") classId: string,
    @Query("date") date: string,
    @Query("session") session?: string,
  ) {
    return this.attendanceService.getClassAttendance(
      tenantId,
      classId,
      date,
      session,
    );
  }

  @Get("student/:studentId/summary")
  @Roles(
    Role.SUPER_ADMIN,
    Role.SCHOOL_ADMIN,
    Role.PRINCIPAL,
    Role.TEACHER,
    Role.PARENT,
  )
  @ApiOperation({ summary: "Get attendance summary for a student" })
  getStudentSummary(
    @TenantId() tenantId: string,
    @Param("studentId") studentId: string,
    @Query("dateFrom") dateFrom: string,
    @Query("dateTo") dateTo: string,
  ) {
    return this.attendanceService.getStudentSummary(
      tenantId,
      studentId,
      dateFrom,
      dateTo,
    );
  }
}
