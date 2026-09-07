import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type GeneratedReportDocument = GeneratedReport & Document;

export enum ReportType {
  STUDENT_REPORT_CARD = "STUDENT_REPORT_CARD",
  CLASS_PERFORMANCE = "CLASS_PERFORMANCE",
  SUBJECT_ANALYSIS = "SUBJECT_ANALYSIS",
  ATTENDANCE_SUMMARY = "ATTENDANCE_SUMMARY",
  FEE_COLLECTION = "FEE_COLLECTION",
  FEE_DEFAULTERS = "FEE_DEFAULTERS",
  STUDENT_LIST = "STUDENT_LIST",
  STAFF_LIST = "STAFF_LIST",
  CUSTOM = "CUSTOM",
}

export enum ReportStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ReportFormat {
  PDF = "PDF",
  EXCEL = "EXCEL",
  CSV = "CSV",
}

@Schema({ timestamps: true })
export class GeneratedReport {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ReportType, required: true })
  type: ReportType;

  @Prop({ type: String, enum: ReportFormat, default: ReportFormat.PDF })
  format: ReportFormat;

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.QUEUED })
  status: ReportStatus;

  @Prop({ type: MongooseSchema.Types.Mixed })
  parameters: Record<string, any>; // Filters used to generate

  @Prop()
  filePath: string; // Path to generated file

  @Prop()
  fileSize: number;

  @Prop()
  errorMessage: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  requestedById: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date })
  completedAt: Date;
}

export const GeneratedReportSchema =
  SchemaFactory.createForClass(GeneratedReport);

GeneratedReportSchema.index({ tenantId: 1, createdAt: -1 });
GeneratedReportSchema.index({ tenantId: 1, type: 1 });
GeneratedReportSchema.index({ tenantId: 1, status: 1 });
GeneratedReportSchema.index({ tenantId: 1, requestedById: 1 });
