import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, Types } from "mongoose";
import { Student, StudentDocument } from "../schemas/student.schema";
import {
  PromotionHistory,
  PromotionHistoryDocument,
} from "../schemas/promotion-history.schema";

@Injectable()
export class StudentRepository {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(PromotionHistory.name)
    private readonly promotionHistoryModel: Model<PromotionHistoryDocument>,
  ) {}

  async create(data: Partial<Student>): Promise<StudentDocument> {
    return this.studentModel.create(data);
  }

  async createMany(data: Partial<Student>[]): Promise<StudentDocument[]> {
    return this.studentModel.insertMany(data) as any;
  }

  async findById(id: string): Promise<StudentDocument | null> {
    return this.studentModel
      .findById(id)
      .populate("guardianIds")
      .populate("currentClassId")
      .populate("currentStreamId")
      .populate("subjectIds")
      .exec();
  }

  async findByAdmissionNumber(
    tenantId: string,
    admissionNumber: string,
  ): Promise<StudentDocument | null> {
    return this.studentModel.findOne({ tenantId, admissionNumber }).exec();
  }

  async findAll(
    filter: FilterQuery<StudentDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: StudentDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .populate("currentClassId")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.studentModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async update(
    id: string,
    data: Partial<Student>,
  ): Promise<StudentDocument | null> {
    return this.studentModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<StudentDocument | null> {
    return this.studentModel
      .findByIdAndUpdate(id, { $set: { isActive: false, status: "TRANSFERRED" } }, { new: true })
      .exec();
  }

  async bulkUpdate(ids: string[], data: Partial<Student>): Promise<number> {
    const result = await this.studentModel.updateMany(
      { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } },
      { $set: data },
    );
    return result.modifiedCount;
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.studentModel
      .countDocuments({ tenantId, isActive: true })
      .exec();
  }

  async countByTenantAndClass(
    tenantId: string,
    classId: string,
  ): Promise<number> {
    return this.studentModel
      .countDocuments({ tenantId, currentClassId: classId, isActive: true })
      .exec();
  }

  async findByGuardian(
    tenantId: string,
    guardianId: string,
  ): Promise<StudentDocument[]> {
    return this.studentModel
      .find({ tenantId, guardianIds: guardianId, isActive: true })
      .populate("currentClassId")
      .exec();
  }

  async findByClass(
    tenantId: string,
    classId: string,
  ): Promise<StudentDocument[]> {
    return this.studentModel
      .find({ tenantId, currentClassId: classId, isActive: true })
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async getDetailedStats(tenantId: string): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byGender: Record<string, number>;
    byStatus: Record<string, number>;
    byBoarding: Record<string, number>;
    bySpecialNeeds: Record<string, number>;
    byFeedingProgram: Record<string, number>;
    byBursary: Record<string, number>;
  }> {
    const filter = { tenantId, isActive: true };

    const [
      total,
      byLevel,
      byGender,
      byStatus,
      byBoarding,
      bySpecialNeeds,
      byFeedingProgram,
      byBursary,
    ] = await Promise.all([
      this.studentModel.countDocuments(filter).exec(),
      this.aggregateCount(filter, "currentLevel"),
      this.aggregateCount(filter, "gender"),
      this.aggregateCount(filter, "status"),
      this.aggregateCount(filter, "boardingStatus"),
      this.aggregateCount(filter, "specialNeedsCategory"),
      this.aggregateCount(filter, "feedingProgram"),
      this.aggregateCount(filter, "bursaryStatus"),
    ]);

    return {
      total,
      byLevel,
      byGender,
      byStatus,
      byBoarding,
      bySpecialNeeds,
      byFeedingProgram,
      byBursary,
    };
  }

  private async aggregateCount(
    baseFilter: FilterQuery<StudentDocument>,
    field: string,
  ): Promise<Record<string, number>> {
    const result = await this.studentModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const map: Record<string, number> = {};
    for (const r of result) {
      map[r._id || "UNSPECIFIED"] = r.count;
    }
    return map;
  }

  async createPromotionHistory(
    data: Partial<PromotionHistory>,
  ): Promise<PromotionHistoryDocument> {
    return this.promotionHistoryModel.create(data);
  }

  async getPromotionHistory(
    studentId: string,
    tenantId: string,
  ): Promise<PromotionHistoryDocument[]> {
    return this.promotionHistoryModel
      .find({ tenantId, studentId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
