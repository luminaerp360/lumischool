import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { SchoolLevel } from "../../../common/enums/school-level.enum";
import { CbcTrack } from "../../../common/enums/cbc-track.enum";

export type ClassDocument = Class & Document;
export type StreamDocument = Stream & Document;

export enum ClassCategory {
  REGULAR = "REGULAR",
  SPECIAL_NEEDS_UNIT = "SPECIAL_NEEDS_UNIT",
  MULTI_GRADE = "MULTI_GRADE",
  ADULT_EDUCATION = "ADULT_EDUCATION",
}

export enum ClassStatus {
  ACTIVE = "ACTIVE",
  FULL = "FULL",
  MERGED = "MERGED",
  ARCHIVED = "ARCHIVED",
  PROVISIONAL = "PROVISIONAL",
}

export const GRADE_RANGES: Record<SchoolLevel, [number, number]> = {
  [SchoolLevel.PRE_PRIMARY]: [1, 2],
  [SchoolLevel.PRIMARY]: [1, 6],
  [SchoolLevel.JSS]: [7, 9],
  [SchoolLevel.SENIOR]: [10, 12],
};

@Schema({ timestamps: true })
export class Class {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: SchoolLevel, required: true })
  level: SchoolLevel;

  @Prop({ required: true })
  grade: number;

  @Prop({ required: true })
  academicYear: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  classTeacherId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  assistantTeacherId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 45 })
  capacity: number;

  @Prop()
  room: string;

  @Prop()
  block: string;

  @Prop({ type: String, enum: ClassCategory, default: ClassCategory.REGULAR })
  category: ClassCategory;

  @Prop({ type: String, enum: ClassStatus, default: ClassStatus.ACTIVE })
  status: ClassStatus;

  @Prop({ default: false })
  isExamCenter: boolean;

  @Prop({ type: String, enum: CbcTrack })
  cbcTrack: CbcTrack;

  @Prop({ default: false })
  isMultiGrade: boolean;

  @Prop({
    type: [
      {
        type: MongooseSchema.Types.ObjectId,
        ref: "Stream",
      },
    ],
    default: [],
  })
  streamIds: MongooseSchema.Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

ClassSchema.index({ tenantId: 1, name: 1, academicYear: 1 }, { unique: true });
ClassSchema.index({ tenantId: 1, level: 1, grade: 1 });
ClassSchema.index({ tenantId: 1, academicYear: 1 });
ClassSchema.index({ tenantId: 1, classTeacherId: 1 });
ClassSchema.index({ tenantId: 1, category: 1 });
ClassSchema.index({ tenantId: 1, cbcTrack: 1 });

@Schema({ timestamps: true })
export class Stream {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Class",
    required: true,
    index: true,
  })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  code: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  streamTeacherId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 45 })
  capacity: number;

  @Prop()
  room: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const StreamSchema = SchemaFactory.createForClass(Stream);

StreamSchema.index({ tenantId: 1, classId: 1, name: 1 }, { unique: true });
StreamSchema.index({ tenantId: 1, code: 1 }, { sparse: true });
