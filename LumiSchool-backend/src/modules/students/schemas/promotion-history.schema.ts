import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { SchoolLevel } from "../../../common/enums/school-level.enum";

export type PromotionHistoryDocument = PromotionHistory & Document;

@Schema({ timestamps: true })
export class PromotionHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: SchoolLevel, required: true })
  fromLevel: SchoolLevel;

  @Prop({ required: true })
  fromGrade: number;

  @Prop({ type: String, enum: SchoolLevel, required: true })
  toLevel: SchoolLevel;

  @Prop({ required: true })
  toGrade: number;

  @Prop()
  fromClassId: string;

  @Prop()
  toClassId: string;

  @Prop({ required: true })
  academicYear: string;

  @Prop()
  reason: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  promotedById: MongooseSchema.Types.ObjectId;
}

export const PromotionHistorySchema =
  SchemaFactory.createForClass(PromotionHistory);

PromotionHistorySchema.index({ tenantId: 1, studentId: 1, createdAt: -1 });
PromotionHistorySchema.index({ tenantId: 1, academicYear: 1 });
