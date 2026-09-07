import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type AnnouncementDocument = Announcement & Document;
export type MessageDocument = Message & Document;

export enum AnnouncementAudience {
  ALL = "ALL",
  STAFF = "STAFF",
  TEACHERS = "TEACHERS",
  PARENTS = "PARENTS",
  STUDENTS = "STUDENTS",
  CLASS = "CLASS", // Specific class
}

export enum AnnouncementPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

@Schema({ timestamps: true })
export class Announcement {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: String, enum: AnnouncementAudience, required: true })
  audience: AnnouncementAudience;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Class" })
  classId: MongooseSchema.Types.ObjectId; // When audience is CLASS

  @Prop({
    type: String,
    enum: AnnouncementPriority,
    default: AnnouncementPriority.NORMAL,
  })
  priority: AnnouncementPriority;

  @Prop({ default: false })
  sendSms: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Date })
  publishedAt: Date;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdById: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ tenantId: 1, createdAt: -1 });
AnnouncementSchema.index({ tenantId: 1, audience: 1 });
AnnouncementSchema.index({ tenantId: 1, isPublished: 1 });

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  senderId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  recipientId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Prop({ type: Date })
  readAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Message" })
  parentMessageId: MongooseSchema.Types.ObjectId; // For threading

  @Prop({ default: false })
  isArchived: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ tenantId: 1, recipientId: 1, createdAt: -1 });
MessageSchema.index({ tenantId: 1, senderId: 1, createdAt: -1 });
MessageSchema.index({ tenantId: 1, parentMessageId: 1 });
