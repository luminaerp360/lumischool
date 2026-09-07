import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type MpesaTransactionDocument = MpesaTransaction & Document;

export enum MpesaTransactionType {
  STK_PUSH = "STK_PUSH",
  C2B = "C2B",
  B2C = "B2C",
}

export enum MpesaTransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

@Schema({ timestamps: true })
export class MpesaTransaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: MpesaTransactionType, required: true })
  type: MpesaTransactionType;

  @Prop()
  merchantRequestId: string;

  @Prop()
  checkoutRequestId: string;

  @Prop()
  mpesaReceiptNumber: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: MpesaTransactionStatus,
    default: MpesaTransactionStatus.PENDING,
  })
  status: MpesaTransactionStatus;

  @Prop()
  resultCode: number;

  @Prop()
  resultDesc: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "FeeInvoice" })
  invoiceId: MongooseSchema.Types.ObjectId;

  @Prop()
  accountReference: string;

  @Prop({ type: Object })
  rawCallback: any;
}

export const MpesaTransactionSchema =
  SchemaFactory.createForClass(MpesaTransaction);

MpesaTransactionSchema.index({ tenantId: 1, checkoutRequestId: 1 });
MpesaTransactionSchema.index(
  { tenantId: 1, mpesaReceiptNumber: 1 },
  { sparse: true },
);
MpesaTransactionSchema.index({ tenantId: 1, invoiceId: 1 });
MpesaTransactionSchema.index({ tenantId: 1, createdAt: -1 });
