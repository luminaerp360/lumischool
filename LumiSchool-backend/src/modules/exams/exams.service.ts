import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { ExamRepository } from "./repositories/exam.repository";
import {
  CreateExamDto,
  UpdateExamDto,
  ExamQueryDto,
  SubmitResultsDto,
  ResultQueryDto,
} from "./dto/exam.dto";
import { GradingScale } from "./schemas/exam.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import { buildPaginationMeta } from "../../common/utils/pagination.util";

@Injectable()
export class ExamsService {
  constructor(private readonly examRepository: ExamRepository) {}

  async createExam(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: CreateExamDto,
  ) {
    const exam = await this.examRepository.createExam({
      ...dto,
      tenantId,
      createdById: userId,
      classIds: dto.classIds.map((id) => new Types.ObjectId(id)) as any,
      subjectIds: dto.subjectIds?.map((id) => new Types.ObjectId(id)) as any,
    } as any);
    return ApiResponse.success(exam, "Exam created successfully");
  }

  async findAllExams(tenantId: Types.ObjectId, query: ExamQueryDto) {
    const { data, total } = await this.examRepository.findAllExams(
      tenantId,
      query,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return ApiResponse.success({ data, meta }, "Exams retrieved successfully");
  }

  async findExamById(tenantId: Types.ObjectId, examId: string) {
    const exam = await this.examRepository.findExamById(tenantId, examId);
    if (!exam) throw new NotFoundException("Exam not found");
    return ApiResponse.success(exam, "Exam retrieved successfully");
  }

  async updateExam(
    tenantId: Types.ObjectId,
    examId: string,
    dto: UpdateExamDto,
  ) {
    const updateData: any = { ...dto };
    if (dto.classIds) {
      updateData.classIds = dto.classIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.subjectIds) {
      updateData.subjectIds = dto.subjectIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const exam = await this.examRepository.updateExam(
      tenantId,
      examId,
      updateData,
    );
    if (!exam) throw new NotFoundException("Exam not found");
    return ApiResponse.success(exam, "Exam updated successfully");
  }

  async deleteExam(tenantId: Types.ObjectId, examId: string) {
    const exam = await this.examRepository.deleteExam(tenantId, examId);
    if (!exam) throw new NotFoundException("Exam not found");
    return ApiResponse.success(null, "Exam deactivated successfully");
  }

  async publishExam(tenantId: Types.ObjectId, examId: string) {
    const exam = await this.examRepository.updateExam(tenantId, examId, {
      isPublished: true,
    });
    if (!exam) throw new NotFoundException("Exam not found");
    return ApiResponse.success(exam, "Exam results published successfully");
  }

  // ── Results ──

  async submitResults(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: SubmitResultsDto,
  ) {
    const exam = await this.examRepository.findExamById(tenantId, dto.examId);
    if (!exam) throw new NotFoundException("Exam not found");

    const results = dto.results.map((r) => ({
      tenantId,
      examId: new Types.ObjectId(dto.examId),
      subjectId: new Types.ObjectId(dto.subjectId),
      classId: new Types.ObjectId(dto.classId),
      studentId: new Types.ObjectId(r.studentId),
      marksObtained: r.marksObtained,
      totalMarks: dto.totalMarks,
      percentage: parseFloat(
        ((r.marksObtained / dto.totalMarks) * 100).toFixed(2),
      ),
      grade: this.calculateGrade(r.marksObtained, dto.totalMarks),
      points: this.calculatePoints(r.marksObtained, dto.totalMarks),
      remarks: r.remarks,
      teacherComments: r.teacherComments,
      gradedById: userId,
      isSynced: true,
    }));

    const bulkResult = await this.examRepository.bulkUpsertResults(
      results as any,
    );
    return ApiResponse.success(
      {
        upserted: bulkResult.upsertedCount,
        modified: bulkResult.modifiedCount,
      },
      `${dto.results.length} results submitted successfully`,
    );
  }

  async findResults(tenantId: Types.ObjectId, query: ResultQueryDto) {
    const { data, total } = await this.examRepository.findResults(
      tenantId,
      query,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return ApiResponse.success(
      { data, meta },
      "Results retrieved successfully",
    );
  }

  async getStudentResults(
    tenantId: Types.ObjectId,
    studentId: string,
    examId?: string,
  ) {
    const results = await this.examRepository.findResultsByStudent(
      tenantId,
      studentId,
      examId,
    );
    return ApiResponse.success(results, "Student results retrieved");
  }

  async getClassResults(
    tenantId: Types.ObjectId,
    examId: string,
    classId: string,
  ) {
    const results = await this.examRepository.findResultsByExamAndClass(
      tenantId,
      examId,
      classId,
    );
    return ApiResponse.success(results, "Class results retrieved");
  }

  async getClassRanking(
    tenantId: Types.ObjectId,
    examId: string,
    classId: string,
  ) {
    const ranking = await this.examRepository.getClassRanking(
      tenantId,
      examId,
      classId,
    );
    // Add rank position
    const ranked = ranking.map((r, i) => ({ ...r, rank: i + 1 }));
    return ApiResponse.success(ranked, "Class ranking retrieved");
  }

  async getSubjectAnalysis(
    tenantId: Types.ObjectId,
    examId: string,
    subjectId: string,
  ) {
    const analysis = await this.examRepository.getSubjectAnalysis(
      tenantId,
      examId,
      subjectId,
    );
    return ApiResponse.success(analysis, "Subject analysis retrieved");
  }

  // ── Grading Helpers ──

  private calculateGrade(marks: number, total: number): GradingScale {
    const pct = (marks / total) * 100;
    if (pct >= 80) return GradingScale.A;
    if (pct >= 75) return GradingScale.A_MINUS;
    if (pct >= 70) return GradingScale.B_PLUS;
    if (pct >= 65) return GradingScale.B;
    if (pct >= 60) return GradingScale.B_MINUS;
    if (pct >= 55) return GradingScale.C_PLUS;
    if (pct >= 50) return GradingScale.C;
    if (pct >= 45) return GradingScale.C_MINUS;
    if (pct >= 40) return GradingScale.D_PLUS;
    if (pct >= 35) return GradingScale.D;
    if (pct >= 30) return GradingScale.D_MINUS;
    return GradingScale.E;
  }

  private calculatePoints(marks: number, total: number): number {
    const pct = (marks / total) * 100;
    if (pct >= 80) return 12;
    if (pct >= 75) return 11;
    if (pct >= 70) return 10;
    if (pct >= 65) return 9;
    if (pct >= 60) return 8;
    if (pct >= 55) return 7;
    if (pct >= 50) return 6;
    if (pct >= 45) return 5;
    if (pct >= 40) return 4;
    if (pct >= 35) return 3;
    if (pct >= 30) return 2;
    return 1;
  }
}
