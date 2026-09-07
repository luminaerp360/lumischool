import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { SchoolLevel } from "../../../common/enums/school-level.enum";

export type SubjectDocument = Subject & Document;
export type SubjectAssignmentDocument = SubjectAssignment & Document;

export enum SubjectCategory {
  CORE = "CORE",
  ELECTIVE = "ELECTIVE",
  OPTIONAL = "OPTIONAL",
  CO_CURRICULAR = "CO_CURRICULAR",
}

@Schema({ timestamps: true })
export class Subject {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Mathematics", "English", "Kiswahili"

  @Prop({ required: true, trim: true })
  code: string; // e.g., "MATH", "ENG", "KIS"

  @Prop({ type: String, enum: SubjectCategory, default: SubjectCategory.CORE })
  category: SubjectCategory;

  @Prop({ type: [{ type: String, enum: SchoolLevel }], default: [] })
  applicableLevels: SchoolLevel[]; // Which levels this subject applies to

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema.index({ tenantId: 1, code: 1 }, { unique: true });
SubjectSchema.index({ tenantId: 1, category: 1 });
SubjectSchema.index({ tenantId: 1, applicableLevels: 1 });

// Teacher-Subject-Class assignment
@Schema({ timestamps: true })
export class SubjectAssignment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Subject",
    required: true,
  })
  subjectId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  teacherId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Class",
    required: true,
  })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Stream" })
  streamId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  academicYear: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SubjectAssignmentSchema =
  SchemaFactory.createForClass(SubjectAssignment);

SubjectAssignmentSchema.index(
  { tenantId: 1, subjectId: 1, classId: 1, streamId: 1, academicYear: 1 },
  { unique: true },
);
SubjectAssignmentSchema.index({ tenantId: 1, teacherId: 1 });
SubjectAssignmentSchema.index({ tenantId: 1, classId: 1 });
