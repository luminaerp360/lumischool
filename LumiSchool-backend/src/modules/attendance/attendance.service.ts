import { Injectable } from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { AttendanceRepository } from "./repositories/attendance.repository";
import {
  MarkAttendanceDto,
  AttendanceQueryDto,
  SyncAttendanceDto,
} from "./dto/attendance.dto";
import {
  AttendanceDocument,
  AttendanceSession,
} from "./schemas/attendance.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async markAttendance(
    tenantId: string,
    dto: MarkAttendanceDto,
    markedById: string,
  ): Promise<ApiResponse<{ processed: number }>> {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const records = dto.records.map((r) => ({
      tenantId: tenantId as any,
      studentId: r.studentId as any,
      classId: dto.classId as any,
      streamId: dto.streamId as any,
      date,
      status: r.status,
      session: dto.session || AttendanceSession.FULL_DAY,
      reason: r.reason,
      markedById: markedById as any,
      academicYear: dto.academicYear,
      term: dto.term,
      isSynced: true,
    }));

    const processed = await this.attendanceRepository.bulkUpsert(records);
    return ApiResponse.success(
      { processed },
      `Attendance marked for ${processed} students`,
    );
  }

  async findAll(
    tenantId: string,
    query: AttendanceQueryDto,
  ): Promise<ApiResponse<AttendanceDocument[]>> {
    const filter: FilterQuery<AttendanceDocument> = { tenantId };

    if (query.classId) filter.classId = query.classId;
    if (query.studentId) filter.studentId = query.studentId;
    if (query.status) filter.status = query.status;
    if (query.session) filter.session = query.session;
    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.date.$lte = new Date(query.dateTo);
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.attendanceRepository.findAll(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Attendance records retrieved", meta);
  }

  async getClassAttendance(
    tenantId: string,
    classId: string,
    date: string,
    session?: string,
  ): Promise<ApiResponse<AttendanceDocument[]>> {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const records = await this.attendanceRepository.findByClassAndDate(
      tenantId,
      classId,
      d,
      session,
    );
    return ApiResponse.success(records, "Class attendance retrieved");
  }

  async getStudentSummary(
    tenantId: string,
    studentId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<ApiResponse<any>> {
    const summary = await this.attendanceRepository.getStudentAttendanceSummary(
      tenantId,
      studentId,
      new Date(dateFrom),
      new Date(dateTo),
    );

    const result: Record<string, number> = {};
    summary.forEach((s) => {
      result[s._id] = s.count;
    });

    return ApiResponse.success(result, "Student attendance summary");
  }

  async syncOfflineAttendance(
    tenantId: string,
    dto: SyncAttendanceDto,
    markedById: string,
  ): Promise<ApiResponse<{ totalProcessed: number }>> {
    let totalProcessed = 0;
    for (const batch of dto.batches) {
      const result = await this.markAttendance(tenantId, batch, markedById);
      totalProcessed += result.data.processed;
    }
    return ApiResponse.success(
      { totalProcessed },
      `Synced ${totalProcessed} attendance records`,
    );
  }
}
