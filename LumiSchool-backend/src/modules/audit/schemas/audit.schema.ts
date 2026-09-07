import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PAYMENT = "PAYMENT",
  EXPORT = "EXPORT",
  PUBLISH = "PUBLISH",
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true })
  userEmail: string;

  @Prop({ type: String, enum: AuditAction, required: true })
  action: AuditAction;

  @Prop({ required: true })
  resource: string; // e.g., 'Student', 'FeePayment', 'User'

  @Prop({ type: MongooseSchema.Types.ObjectId })
  resourceId: MongooseSchema.Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  previousData: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newData: Record<string, any>;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, action: 1 });
AuditLogSchema.index({ tenantId: 1, resource: 1 });
AuditLogSchema.index({ tenantId: 1, userId: 1 });
