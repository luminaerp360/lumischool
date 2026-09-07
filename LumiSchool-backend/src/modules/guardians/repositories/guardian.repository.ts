import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { Guardian, GuardianDocument } from "../schemas/guardian.schema";

@Injectable()
export class GuardianRepository {
  constructor(
    @InjectModel(Guardian.name)
    private readonly guardianModel: Model<GuardianDocument>,
  ) {}

  async create(data: Partial<Guardian>): Promise<GuardianDocument> {
    return this.guardianModel.create(data);
  }

  async findById(id: string): Promise<GuardianDocument | null> {
    return this.guardianModel.findById(id).populate("studentIds").exec();
  }

  async findByPhone(
    tenantId: string,
    phone: string,
  ): Promise<GuardianDocument | null> {
    return this.guardianModel.findOne({ tenantId, phone }).exec();
  }

  async findAll(
    filter: FilterQuery<GuardianDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: GuardianDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.guardianModel
        .find(filter)
        .populate("studentIds", "firstName lastName admissionNumber")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.guardianModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async update(
    id: string,
    data: Partial<Guardian>,
  ): Promise<GuardianDocument | null> {
    return this.guardianModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("studentIds")
      .exec();
  }

  async addStudent(
    guardianId: string,
    studentId: string,
  ): Promise<GuardianDocument | null> {
    return this.guardianModel
      .findByIdAndUpdate(
        guardianId,
        { $addToSet: { studentIds: studentId } },
        { new: true },
      )
      .populate("studentIds")
      .exec();
  }

  async removeStudent(
    guardianId: string,
    studentId: string,
  ): Promise<GuardianDocument | null> {
    return this.guardianModel
      .findByIdAndUpdate(
        guardianId,
        { $pull: { studentIds: studentId } },
        { new: true },
      )
      .populate("studentIds")
      .exec();
  }

  async findByStudent(
    tenantId: string,
    studentId: string,
  ): Promise<GuardianDocument[]> {
    return this.guardianModel
      .find({ tenantId, studentIds: studentId, isActive: true })
      .exec();
  }
}
