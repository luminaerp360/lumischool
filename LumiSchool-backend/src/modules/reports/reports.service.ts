import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { ReportRepository } from "./repositories/report.repository";
import { GenerateReportDto, ReportQueryDto } from "./dto/report.dto";
import { ReportStatus } from "./schemas/report.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import { buildPaginationMeta } from "../../common/utils/pagination.util";

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly reportRepository: ReportRepository) {}

  async generateReport(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: GenerateReportDto,
  ) {
    const report = await this.reportRepository.create({
      ...dto,
      tenantId,
      requestedById: userId,
      status: ReportStatus.QUEUED,
    } as any);

    // TODO: Dispatch to BullMQ queue for async processing
    // For now, mark as processing immediately
    this.processReport(report._id.toString(), tenantId, dto).catch((err) =>
      this.logger.error(`Report generation failed: ${err.message}`, err.stack),
    );

    return ApiResponse.success(report, "Report generation queued");
  }

  async findAll(tenantId: Types.ObjectId, query: ReportQueryDto) {
    const { data, total } = await this.reportRepository.findAll(
      tenantId,
      query,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return ApiResponse.success({ data, meta }, "Reports retrieved");
  }

  async findById(tenantId: Types.ObjectId, id: string) {
    const report = await this.reportRepository.findById(tenantId, id);
    if (!report) throw new NotFoundException("Report not found");
    return ApiResponse.success(report, "Report retrieved");
  }

  async deleteReport(tenantId: Types.ObjectId, id: string) {
    const report = await this.reportRepository.delete(tenantId, id);
    if (!report) throw new NotFoundException("Report not found");
    return ApiResponse.success(null, "Report deleted");
  }

  // ── Dashboard Stats ──

  async getDashboardStats(tenantId: Types.ObjectId) {
    // Placeholder: aggregate key metrics across modules
    const stats = {
      message:
        "Dashboard stats endpoint ready. Connect to individual module repositories for live data.",
      tenantId: tenantId ? tenantId.toString() : null,
    };
    return ApiResponse.success(stats, "Dashboard stats retrieved");
  }

  // ── Internal Report Processing ──

  private async processReport(
    reportId: string,
    tenantId: Types.ObjectId,
    dto: GenerateReportDto,
  ) {
    try {
      await this.reportRepository.updateStatus(
        reportId,
        ReportStatus.PROCESSING,
      );

      // TODO: Implement actual report generation logic per type
      // - STUDENT_REPORT_CARD: Aggregate exam results, attendance for a student
      // - CLASS_PERFORMANCE: Aggregate exam results by class
      // - ATTENDANCE_SUMMARY: Aggregate attendance by date range
      // - FEE_COLLECTION: Aggregate payments by date range
      // - FEE_DEFAULTERS: Find students with outstanding balances

      // Placeholder: mark as completed
      await this.reportRepository.updateStatus(
        reportId,
        ReportStatus.COMPLETED,
        {
          completedAt: new Date(),
        },
      );
    } catch (error) {
      await this.reportRepository.updateStatus(reportId, ReportStatus.FAILED, {
        errorMessage: error.message,
      });
    }
  }
}
