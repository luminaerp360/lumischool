import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type SmsLogDocument = SmsLog & Document;

export enum SmsStatus {
  QUEUED = "QUEUED",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export enum SmsCategory {
  FEE_REMINDER = "FEE_REMINDER",
  PAYMENT_CONFIRMATION = "PAYMENT_CONFIRMATION",
  ATTENDANCE_ALERT = "ATTENDANCE_ALERT",
  EXAM_RESULTS = "EXAM_RESULTS",
  GENERAL = "GENERAL",
  EMERGENCY = "EMERGENCY",
}

@Schema({ timestamps: true })
export class SmsLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: SmsStatus, default: SmsStatus.QUEUED })
  status: SmsStatus;

  @Prop({ type: String, enum: SmsCategory, default: SmsCategory.GENERAL })
  category: SmsCategory;

  @Prop()
  externalId: string; // Africa's Talking message ID

  @Prop()
  cost: string;

  @Prop()
  errorMessage: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  sentById: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Student" })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Guardian" })
  guardianId: MongooseSchema.Types.ObjectId;
}

export const SmsLogSchema = SchemaFactory.createForClass(SmsLog);

SmsLogSchema.index({ tenantId: 1, createdAt: -1 });
SmsLogSchema.index({ tenantId: 1, category: 1 });
SmsLogSchema.index({ tenantId: 1, status: 1 });
SmsLogSchema.index({ tenantId: 1, phoneNumber: 1 });
