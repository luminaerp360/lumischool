import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { SchoolLevel } from "../../../common/enums/school-level.enum";

export type FeeStructureDocument = FeeStructure & Document;
export type FeeInvoiceDocument = FeeInvoice & Document;
export type FeePaymentDocument = FeePayment & Document;

export enum FeeCategory {
  TUITION = "TUITION",
  BOARDING = "BOARDING",
  TRANSPORT = "TRANSPORT",
  UNIFORM = "UNIFORM",
  BOOKS = "BOOKS",
  EXAM = "EXAM",
  ACTIVITY = "ACTIVITY",
  LUNCH = "LUNCH",
  DEVELOPMENT = "DEVELOPMENT",
  OTHER = "OTHER",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  MPESA = "MPESA",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  BURSARY = "BURSARY",
  SCHOLARSHIP = "SCHOLARSHIP",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

// Fee Structure - defines what fees apply per level/grade/term
@Schema({ timestamps: true })
export class FeeStructure {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Grade 1 Term 1 Fees 2025"

  @Prop({ required: true })
  academicYear: string;

  @Prop({ required: true })
  term: string; // TERM_1, TERM_2, TERM_3

  @Prop({ type: String, enum: SchoolLevel, required: true })
  level: SchoolLevel;

  @Prop()
  grade: number;

  @Prop({
    type: [
      {
        category: { type: String, enum: FeeCategory },
        description: String,
        amount: Number,
        isOptional: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  items: {
    category: FeeCategory;
    description: string;
    amount: number;
    isOptional: boolean;
  }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);

FeeStructureSchema.index(
  { tenantId: 1, academicYear: 1, term: 1, level: 1, grade: 1 },
  { unique: true },
);

// Fee Invoice - generated per student per term
@Schema({ timestamps: true })
export class FeeInvoice {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  invoiceNumber: string; // Auto-generated: INV-2025-00001

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Student",
    required: true,
  })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "FeeStructure",
  })
  feeStructureId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  academicYear: string;

  @Prop({ required: true })
  term: string;

  @Prop({
    type: [
      {
        category: { type: String, enum: FeeCategory },
        description: String,
        amount: Number,
      },
    ],
    default: [],
  })
  items: {
    category: FeeCategory;
    description: string;
    amount: number;
  }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop()
  discountReason: string;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({
    type: String,
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  generatedById: MongooseSchema.Types.ObjectId;
}

export const FeeInvoiceSchema = SchemaFactory.createForClass(FeeInvoice);

FeeInvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
FeeInvoiceSchema.index({ tenantId: 1, studentId: 1, academicYear: 1, term: 1 });
FeeInvoiceSchema.index({ tenantId: 1, status: 1 });
FeeInvoiceSchema.index({ tenantId: 1, dueDate: 1 });

// Fee Payment - records each payment made
@Schema({ timestamps: true })
export class FeePayment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  receiptNumber: string; // Auto-generated: RCP-2025-00001

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "FeeInvoice",
    required: true,
  })
  invoiceId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Student",
    required: true,
  })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @Prop()
  mpesaTransactionId: string;

  @Prop()
  mpesaPhoneNumber: string;

  @Prop()
  bankReference: string;

  @Prop()
  chequeNumber: string;

  @Prop({ type: Date, default: Date.now })
  paymentDate: Date;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  receivedById: MongooseSchema.Types.ObjectId;
}

export const FeePaymentSchema = SchemaFactory.createForClass(FeePayment);

FeePaymentSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });
FeePaymentSchema.index({ tenantId: 1, invoiceId: 1 });
FeePaymentSchema.index({ tenantId: 1, studentId: 1 });
FeePaymentSchema.index({ tenantId: 1, paymentDate: -1 });
FeePaymentSchema.index(
  { tenantId: 1, mpesaTransactionId: 1 },
  { sparse: true },
);
