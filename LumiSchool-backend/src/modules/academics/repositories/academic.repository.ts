import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  Subject,
  SubjectDocument,
  SubjectAssignment,
  SubjectAssignmentDocument,
} from "../schemas/subject.schema";

@Injectable()
export class AcademicRepository {
  constructor(
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(SubjectAssignment.name)
    private readonly assignmentModel: Model<SubjectAssignmentDocument>,
  ) {}

  // ---- Subjects ----
  async createSubject(data: Partial<Subject>): Promise<SubjectDocument> {
    return this.subjectModel.create(data);
  }

  async findSubjectById(id: string): Promise<SubjectDocument | null> {
    return this.subjectModel.findById(id).exec();
  }

  async findSubjectByCode(
    tenantId: string,
    code: string,
  ): Promise<SubjectDocument | null> {
    return this.subjectModel.findOne({ tenantId, code }).exec();
  }

  async findAllSubjects(
    filter: FilterQuery<SubjectDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: SubjectDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.subjectModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.subjectModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async updateSubject(
    id: string,
    data: Partial<Subject>,
  ): Promise<SubjectDocument | null> {
    return this.subjectModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  // ---- Assignments ----
  async createAssignment(
    data: Partial<SubjectAssignment>,
  ): Promise<SubjectAssignmentDocument> {
    return this.assignmentModel.create(data);
  }

  async findAssignmentById(
    id: string,
  ): Promise<SubjectAssignmentDocument | null> {
    return this.assignmentModel
      .findById(id)
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName")
      .populate("classId", "name level grade")
      .exec();
  }

  async findAllAssignments(
    tenantId: string,
    filter: Partial<{
      classId: string;
      teacherId: string;
      academicYear: string;
    }> = {},
  ): Promise<SubjectAssignmentDocument[]> {
    const query: Record<string, any> = { tenantId, isActive: true };
    if (filter.classId) query.classId = filter.classId;
    if (filter.teacherId) query.teacherId = filter.teacherId;
    if (filter.academicYear) query.academicYear = filter.academicYear;
    return this.assignmentModel
      .find(query)
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName")
      .populate("classId", "name level grade")
      .populate("streamId", "name")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAssignmentsByClass(
    tenantId: string,
    classId: string,
    academicYear: string,
  ): Promise<SubjectAssignmentDocument[]> {
    return this.assignmentModel
      .find({ tenantId, classId, academicYear, isActive: true })
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName")
      .populate("streamId", "name")
      .sort({ "subjectId.name": 1 })
      .exec();
  }

  async findAssignmentsByTeacher(
    tenantId: string,
    teacherId: string,
    academicYear: string,
  ): Promise<SubjectAssignmentDocument[]> {
    return this.assignmentModel
      .find({ tenantId, teacherId, academicYear, isActive: true })
      .populate("subjectId", "name code")
      .populate("classId", "name level grade")
      .populate("streamId", "name")
      .exec();
  }

  async updateAssignment(
    id: string,
    data: Partial<SubjectAssignment>,
  ): Promise<SubjectAssignmentDocument | null> {
    return this.assignmentModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName")
      .populate("classId", "name level grade")
      .exec();
  }

  async deleteAssignment(id: string): Promise<void> {
    await this.assignmentModel.findByIdAndUpdate(id, {
      $set: { isActive: false },
    });
  }
}
