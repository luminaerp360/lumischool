import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ExamDocument = Exam & Document;
export type ExamResultDocument = ExamResult & Document;

export enum ExamType {
  CAT = "CAT", // Continuous Assessment Test
  MID_TERM = "MID_TERM",
  END_TERM = "END_TERM",
  MOCK = "MOCK",
  NATIONAL = "NATIONAL",
  ASSIGNMENT = "ASSIGNMENT",
}

export enum GradingScale {
  // CBC grading
  EE = "EE", // Exceeding Expectations
  ME = "ME", // Meeting Expectations
  AE = "AE", // Approaching Expectations
  BE = "BE", // Below Expectations
  // Traditional grading
  A = "A",
  A_MINUS = "A-",
  B_PLUS = "B+",
  B = "B",
  B_MINUS = "B-",
  C_PLUS = "C+",
  C = "C",
  C_MINUS = "C-",
  D_PLUS = "D+",
  D = "D",
  D_MINUS = "D-",
  E = "E",
}

@Schema({ timestamps: true })
export class Exam {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Term 1 Mid-Term 2025"

  @Prop({ type: String, enum: ExamType, required: true })
  type: ExamType;

  @Prop({ required: true })
  academicYear: string;

  @Prop({ required: true })
  term: string;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Class" }],
    default: [],
  })
  classIds: MongooseSchema.Types.ObjectId[]; // Which classes this exam applies to

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Subject" }],
    default: [],
  })
  subjectIds: MongooseSchema.Types.ObjectId[]; // Which subjects are examined

  @Prop({ default: 100 })
  totalMarks: number;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  createdById: MongooseSchema.Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.index({ tenantId: 1, academicYear: 1, term: 1 });
ExamSchema.index({ tenantId: 1, type: 1 });
ExamSchema.index({ tenantId: 1, classIds: 1 });
ExamSchema.index({ tenantId: 1, createdAt: -1 });

@Schema({ timestamps: true })
export class ExamResult {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Exam",
    required: true,
  })
  examId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Student",
    required: true,
  })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Subject",
    required: true,
  })
  subjectId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Class",
    required: true,
  })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  marksObtained: number;

  @Prop({ required: true })
  totalMarks: number;

  @Prop()
  percentage: number;

  @Prop({ type: String, enum: GradingScale })
  grade: GradingScale;

  @Prop()
  points: number; // Grade points for ranking

  @Prop()
  remarks: string;

  @Prop()
  teacherComments: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  gradedById: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isSynced: boolean; // For offline sync
}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);

ExamResultSchema.index(
  { tenantId: 1, examId: 1, studentId: 1, subjectId: 1 },
  { unique: true },
);
ExamResultSchema.index({ tenantId: 1, examId: 1, classId: 1 });
ExamResultSchema.index({ tenantId: 1, studentId: 1 });
ExamResultSchema.index({ tenantId: 1, examId: 1, subjectId: 1 });
