import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, Types } from "mongoose";
import {
  Class,
  ClassDocument,
  Stream,
  StreamDocument,
} from "../schemas/class.schema";

@Injectable()
export class ClassRepository {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Stream.name)
    private readonly streamModel: Model<StreamDocument>,
  ) {}

  async createClass(data: Partial<Class>): Promise<ClassDocument> {
    return this.classModel.create(data);
  }

  async createClasses(data: Partial<Class>[]): Promise<ClassDocument[]> {
    return this.classModel.insertMany(data) as any;
  }

  async findClassById(id: string): Promise<ClassDocument | null> {
    return this.classModel
      .findById(id)
      .populate("classTeacherId", "firstName lastName")
      .populate("assistantTeacherId", "firstName lastName")
      .populate("streamIds")
      .exec();
  }

  async findAllClasses(
    filter: FilterQuery<ClassDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: ClassDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.classModel
        .find(filter)
        .populate("classTeacherId", "firstName lastName")
        .populate("assistantTeacherId", "firstName lastName")
        .populate("streamIds")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.classModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async findAllClassesNoPagination(
    filter: FilterQuery<ClassDocument>,
  ): Promise<ClassDocument[]> {
    return this.classModel.find(filter).sort({ grade: 1, name: 1 }).exec();
  }

  async updateClass(
    id: string,
    data: Partial<Class>,
  ): Promise<ClassDocument | null> {
    return this.classModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("classTeacherId", "firstName lastName")
      .populate("assistantTeacherId", "firstName lastName")
      .populate("streamIds")
      .exec();
  }

  async softDeleteClass(id: string): Promise<ClassDocument | null> {
    return this.classModel
      .findByIdAndUpdate(
        id,
        { $set: { isActive: false, status: "ARCHIVED" } },
        { new: true },
      )
      .exec();
  }

  async addStreamToClass(classId: string, streamId: string): Promise<void> {
    await this.classModel.findByIdAndUpdate(classId, {
      $addToSet: { streamIds: streamId },
    });
  }

  async getClassStats(tenantId: string, classId: string): Promise<{
    studentCount: number;
    streamCount: number;
    fillRate: number;
  }> {
    const StreamModel = this.streamModel;
    const cls = await this.classModel.findOne({ tenantId, _id: classId }).exec();
    if (!cls) return { studentCount: 0, streamCount: 0, fillRate: 0 };

    const streamCount = await StreamModel.countDocuments({
      tenantId,
      classId,
      isActive: true,
    }).exec();

    const StudentModel = (this.classModel as any).db.model("Student");
    const studentCount = await StudentModel.countDocuments({
      tenantId,
      currentClassId: classId,
      isActive: true,
    }).exec();

    const fillRate =
      cls.capacity > 0
        ? Math.round((studentCount / cls.capacity) * 100)
        : 0;

    return { studentCount, streamCount, fillRate };
  }

  async createStream(data: Partial<Stream>): Promise<StreamDocument> {
    return this.streamModel.create(data);
  }

  async createStreams(data: Partial<Stream>[]): Promise<StreamDocument[]> {
    return this.streamModel.insertMany(data) as any;
  }

  async findStreamById(id: string): Promise<StreamDocument | null> {
    return this.streamModel
      .findById(id)
      .populate("classId")
      .populate("streamTeacherId", "firstName lastName")
      .exec();
  }

  async findStreamsByClass(
    tenantId: string,
    classId: string,
  ): Promise<StreamDocument[]> {
    return this.streamModel
      .find({ tenantId, classId, isActive: true })
      .populate("streamTeacherId", "firstName lastName")
      .sort({ name: 1 })
      .exec();
  }

  async updateStream(
    id: string,
    data: Partial<Stream>,
  ): Promise<StreamDocument | null> {
    return this.streamModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  async softDeleteStream(id: string): Promise<void> {
    await this.streamModel.findByIdAndUpdate(id, {
      $set: { isActive: false },
    });
  }
}
