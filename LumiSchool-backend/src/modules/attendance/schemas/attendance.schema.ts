import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type AttendanceDocument = Attendance & Document;

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
  HALF_DAY = "HALF_DAY",
}

export enum AttendanceSession {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  FULL_DAY = "FULL_DAY",
}

@Schema({ timestamps: true })
export class Attendance {
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
  })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Class",
    required: true,
  })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Stream" })
  streamId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({
    type: String,
    enum: AttendanceStatus,
    required: true,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Prop({
    type: String,
    enum: AttendanceSession,
    default: AttendanceSession.FULL_DAY,
  })
  session: AttendanceSession;

  @Prop()
  reason: string; // Reason for absence/late

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  markedById: MongooseSchema.Types.ObjectId; // Teacher who marked

  @Prop()
  academicYear: string;

  @Prop()
  term: string;

  @Prop({ default: false })
  isSynced: boolean; // For offline sync support
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Prevent duplicate attendance for same student/date/session
AttendanceSchema.index(
  { tenantId: 1, studentId: 1, date: 1, session: 1 },
  { unique: true },
);
AttendanceSchema.index({ tenantId: 1, classId: 1, date: 1 });
AttendanceSchema.index({ tenantId: 1, studentId: 1, date: 1 });
AttendanceSchema.index({ tenantId: 1, date: 1, status: 1 });
AttendanceSchema.index({ tenantId: 1, academicYear: 1, term: 1 });
