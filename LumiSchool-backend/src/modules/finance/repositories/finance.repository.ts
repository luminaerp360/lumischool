import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  FeeStructure,
  FeeStructureDocument,
  FeeInvoice,
  FeeInvoiceDocument,
  FeePayment,
  FeePaymentDocument,
} from "../schemas/finance.schema";

@Injectable()
export class FinanceRepository {
  constructor(
    @InjectModel(FeeStructure.name)
    private readonly feeStructureModel: Model<FeeStructureDocument>,
    @InjectModel(FeeInvoice.name)
    private readonly feeInvoiceModel: Model<FeeInvoiceDocument>,
    @InjectModel(FeePayment.name)
    private readonly feePaymentModel: Model<FeePaymentDocument>,
  ) {}

  // ---- Fee Structures ----
  async createFeeStructure(
    data: Partial<FeeStructure>,
  ): Promise<FeeStructureDocument> {
    return this.feeStructureModel.create(data);
  }

  async findFeeStructureById(id: string): Promise<FeeStructureDocument | null> {
    return this.feeStructureModel.findById(id).exec();
  }

  async findAllFeeStructures(
    filter: FilterQuery<FeeStructureDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: FeeStructureDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.feeStructureModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.feeStructureModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async updateFeeStructure(
    id: string,
    data: Partial<FeeStructure>,
  ): Promise<FeeStructureDocument | null> {
    return this.feeStructureModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  // ---- Invoices ----
  async createInvoice(data: Partial<FeeInvoice>): Promise<FeeInvoiceDocument> {
    return this.feeInvoiceModel.create(data);
  }

  async createManyInvoices(
    data: Partial<FeeInvoice>[],
  ): Promise<FeeInvoiceDocument[]> {
    return this.feeInvoiceModel.insertMany(data) as any;
  }

  async findInvoiceById(id: string): Promise<FeeInvoiceDocument | null> {
    return this.feeInvoiceModel
      .findById(id)
      .populate("studentId", "firstName lastName admissionNumber")
      .populate("feeStructureId", "name")
      .exec();
  }

  async findAllInvoices(
    filter: FilterQuery<FeeInvoiceDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: FeeInvoiceDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.feeInvoiceModel
        .find(filter)
        .populate("studentId", "firstName lastName admissionNumber")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.feeInvoiceModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async updateInvoice(
    id: string,
    data: Partial<FeeInvoice>,
  ): Promise<FeeInvoiceDocument | null> {
    return this.feeInvoiceModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("studentId", "firstName lastName admissionNumber")
      .exec();
  }

  async getNextInvoiceNumber(tenantId: string): Promise<string> {
    const seq = await this.getNextInvoiceSequence(tenantId);
    return `INV-${new Date().getFullYear()}-${seq.toString().padStart(5, "0")}`;
  }

  async getNextInvoiceSequence(tenantId: string): Promise<number> {
    const lastInvoice = await this.feeInvoiceModel
      .findOne({ tenantId })
      .sort({ invoiceNumber: -1 })
      .select("invoiceNumber")
      .exec();

    if (!lastInvoice?.invoiceNumber) return 1;
    const parts = lastInvoice.invoiceNumber.split("-");
    return parseInt(parts[2] || "0", 10) + 1;
  }

  // ---- Payments ----
  async createPayment(data: Partial<FeePayment>): Promise<FeePaymentDocument> {
    return this.feePaymentModel.create(data);
  }

  async findPaymentById(id: string): Promise<FeePaymentDocument | null> {
    return this.feePaymentModel
      .findById(id)
      .populate("invoiceId")
      .populate("studentId", "firstName lastName admissionNumber")
      .populate("receivedById", "firstName lastName")
      .exec();
  }

  async findAllPayments(
    filter: FilterQuery<FeePaymentDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: FeePaymentDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.feePaymentModel
        .find(filter)
        .populate("studentId", "firstName lastName admissionNumber")
        .populate("invoiceId", "invoiceNumber totalAmount balance")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.feePaymentModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async getNextReceiptNumber(tenantId: string): Promise<string> {
    const lastPayment = await this.feePaymentModel
      .findOne({ tenantId })
      .sort({ createdAt: -1 })
      .select("receiptNumber")
      .exec();

    const year = new Date().getFullYear();
    if (!lastPayment?.receiptNumber) {
      return `RCP-${year}-00001`;
    }

    const parts = lastPayment.receiptNumber.split("-");
    const num = parseInt(parts[2] || "0", 10) + 1;
    return `RCP-${year}-${num.toString().padStart(5, "0")}`;
  }

  async getTotalCollections(
    tenantId: string,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<number> {
    const result = await this.feePaymentModel.aggregate([
      {
        $match: {
          tenantId: { $eq: tenantId },
          paymentStatus: "COMPLETED",
          paymentDate: { $gte: dateFrom, $lte: dateTo },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total || 0;
  }

  async getOutstandingBalance(tenantId: string): Promise<number> {
    const result = await this.feeInvoiceModel.aggregate([
      {
        $match: {
          tenantId: { $eq: tenantId },
          status: { $in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);
    return result[0]?.total || 0;
  }
}
