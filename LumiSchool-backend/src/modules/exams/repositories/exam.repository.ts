import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Exam,
  ExamDocument,
  ExamResult,
  ExamResultDocument,
} from "../schemas/exam.schema";
import { buildMongoosePaginationOptions } from "../../../common/utils/pagination.util";

@Injectable()
export class ExamRepository {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(ExamResult.name)
    private examResultModel: Model<ExamResultDocument>,
  ) {}

  // ── Exam CRUD ──
  async createExam(data: Partial<Exam>): Promise<ExamDocument> {
    return this.examModel.create(data);
  }

  async findExamById(
    tenantId: Types.ObjectId,
    examId: string,
  ): Promise<ExamDocument | null> {
    return this.examModel
      .findOne({ _id: examId, tenantId })
      .populate("classIds", "name level grade")
      .populate("subjectIds", "name code")
      .populate("createdById", "firstName lastName")
      .exec();
  }

  async findAllExams(
    tenantId: Types.ObjectId,
    query: any,
  ): Promise<{ data: ExamDocument[]; total: number }> {
    const filter: any = { tenantId };
    if (query.type) filter.type = query.type;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.term) filter.term = query.term;
    if (query.classId) filter.classIds = new Types.ObjectId(query.classId);

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.examModel
        .find(filter)
        .populate("classIds", "name level grade")
        .populate("subjectIds", "name code")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.examModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async updateExam(
    tenantId: Types.ObjectId,
    examId: string,
    data: Partial<Exam>,
  ): Promise<ExamDocument | null> {
    return this.examModel
      .findOneAndUpdate(
        { _id: examId, tenantId },
        { $set: data },
        { new: true },
      )
      .exec();
  }

  async deleteExam(
    tenantId: Types.ObjectId,
    examId: string,
  ): Promise<ExamDocument | null> {
    return this.examModel
      .findOneAndUpdate(
        { _id: examId, tenantId },
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();
  }

  // ── Exam Results ──
  async bulkUpsertResults(results: Partial<ExamResult>[]): Promise<any> {
    const operations = results.map((r) => ({
      updateOne: {
        filter: {
          tenantId: r.tenantId,
          examId: r.examId,
          studentId: r.studentId,
          subjectId: r.subjectId,
        },
        update: { $set: r },
        upsert: true,
      },
    }));
    return this.examResultModel.bulkWrite(operations);
  }

  async findResultsByExamAndClass(
    tenantId: Types.ObjectId,
    examId: string,
    classId: string,
  ): Promise<ExamResultDocument[]> {
    return this.examResultModel
      .find({ tenantId, examId, classId })
      .populate("studentId", "firstName lastName admissionNumber")
      .populate("subjectId", "name code")
      .populate("gradedById", "firstName lastName")
      .sort({ subjectId: 1, marksObtained: -1 })
      .exec();
  }

  async findResultsByStudent(
    tenantId: Types.ObjectId,
    studentId: string,
    examId?: string,
  ): Promise<ExamResultDocument[]> {
    const filter: any = { tenantId, studentId };
    if (examId) filter.examId = examId;

    return this.examResultModel
      .find(filter)
      .populate("examId", "name type academicYear term")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findResults(
    tenantId: Types.ObjectId,
    query: any,
  ): Promise<{ data: ExamResultDocument[]; total: number }> {
    const filter: any = { tenantId };
    if (query.examId) filter.examId = query.examId;
    if (query.studentId) filter.studentId = query.studentId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.classId) filter.classId = query.classId;

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.examResultModel
        .find(filter)
        .populate("examId", "name type")
        .populate("studentId", "firstName lastName admissionNumber")
        .populate("subjectId", "name code")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.examResultModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async getClassRanking(
    tenantId: Types.ObjectId,
    examId: string,
    classId: string,
  ): Promise<any[]> {
    return this.examResultModel
      .aggregate([
        {
          $match: {
            tenantId: new Types.ObjectId(tenantId as any),
            examId: new Types.ObjectId(examId),
            classId: new Types.ObjectId(classId),
          },
        },
        {
          $group: {
            _id: "$studentId",
            totalMarks: { $sum: "$marksObtained" },
            totalPossible: { $sum: "$totalMarks" },
            subjectCount: { $sum: 1 },
            averagePercentage: { $avg: "$percentage" },
            totalPoints: { $sum: "$points" },
          },
        },
        { $sort: { totalMarks: -1 } },
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        {
          $project: {
            studentId: "$_id",
            studentName: {
              $concat: ["$student.firstName", " ", "$student.lastName"],
            },
            admissionNumber: "$student.admissionNumber",
            totalMarks: 1,
            totalPossible: 1,
            subjectCount: 1,
            averagePercentage: { $round: ["$averagePercentage", 2] },
            totalPoints: 1,
          },
        },
      ])
      .exec();
  }

  async getSubjectAnalysis(
    tenantId: Types.ObjectId,
    examId: string,
    subjectId: string,
  ): Promise<any> {
    const result = await this.examResultModel
      .aggregate([
        {
          $match: {
            tenantId: new Types.ObjectId(tenantId as any),
            examId: new Types.ObjectId(examId),
            subjectId: new Types.ObjectId(subjectId),
          },
        },
        {
          $group: {
            _id: null,
            avgMarks: { $avg: "$marksObtained" },
            maxMarks: { $max: "$marksObtained" },
            minMarks: { $min: "$marksObtained" },
            avgPercentage: { $avg: "$percentage" },
            totalStudents: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            avgMarks: { $round: ["$avgMarks", 2] },
            maxMarks: 1,
            minMarks: 1,
            avgPercentage: { $round: ["$avgPercentage", 2] },
            totalStudents: 1,
          },
        },
      ])
      .exec();
    return result[0] || null;
  }
}
