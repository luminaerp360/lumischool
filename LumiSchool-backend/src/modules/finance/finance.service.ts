import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { FinanceRepository } from "./repositories/finance.repository";
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  GenerateInvoicesDto,
  ApplyDiscountDto,
  InvoiceQueryDto,
  RecordPaymentDto,
  PaymentQueryDto,
} from "./dto/finance.dto";
import {
  FeeStructureDocument,
  FeeInvoiceDocument,
  FeePaymentDocument,
  InvoiceStatus,
} from "./schemas/finance.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";

@Injectable()
export class FinanceService {
  constructor(private readonly financeRepository: FinanceRepository) {}

  // ---- Fee Structures ----
  async createFeeStructure(
    tenantId: string,
    dto: CreateFeeStructureDto,
  ): Promise<ApiResponse<FeeStructureDocument>> {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    const structure = await this.financeRepository.createFeeStructure({
      ...dto,
      tenantId: tenantId as any,
      totalAmount,
    } as any);

    return ApiResponse.success(structure, "Fee structure created successfully");
  }

  async findAllFeeStructures(
    tenantId: string,
    query: any,
  ): Promise<ApiResponse<FeeStructureDocument[]>> {
    const filter: FilterQuery<FeeStructureDocument> = {
      tenantId,
      isActive: true,
    };

    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.term) filter.term = query.term;
    if (query.level) filter.level = query.level;

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.financeRepository.findAllFeeStructures(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Fee structures retrieved", meta);
  }

  async updateFeeStructure(
    id: string,
    tenantId: string,
    dto: UpdateFeeStructureDto,
  ): Promise<ApiResponse<FeeStructureDocument>> {
    const structure = await this.financeRepository.findFeeStructureById(id);
    if (!structure || structure.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Fee structure not found");
    }

    const updateData: any = { ...dto };
    if (dto.items) {
      updateData.totalAmount = dto.items.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
    }

    const updated = await this.financeRepository.updateFeeStructure(
      id,
      updateData,
    );
    return ApiResponse.success(updated, "Fee structure updated");
  }

  // ---- Invoices ----
  async generateInvoices(
    tenantId: string,
    dto: GenerateInvoicesDto,
    generatedById: string,
  ): Promise<ApiResponse<{ generated: number }>> {
    const structure = await this.financeRepository.findFeeStructureById(
      dto.feeStructureId,
    );
    if (!structure || structure.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Fee structure not found");
    }

    // For now, generate for explicitly provided studentIds
    if (!dto.studentIds || dto.studentIds.length === 0) {
      throw new BadRequestException("Student IDs are required");
    }

    // Fetch the starting sequence once, then increment locally to avoid
    // duplicate key errors when bulk-inserting multiple invoices.
    const year = new Date().getFullYear();
    let seq = await this.financeRepository.getNextInvoiceSequence(tenantId);

    const invoices = [];
    for (const studentId of dto.studentIds) {
      const invoiceNumber = `INV-${year}-${(seq++).toString().padStart(5, "0")}`;
      invoices.push({
        tenantId: tenantId as any,
        invoiceNumber,
        studentId: studentId as any,
        feeStructureId: dto.feeStructureId as any,
        academicYear: structure.academicYear,
        term: structure.term,
        items: structure.items,
        totalAmount: structure.totalAmount,
        paidAmount: 0,
        balance: structure.totalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: InvoiceStatus.SENT,
        generatedById: generatedById as any,
      });
    }

    const created = await this.financeRepository.createManyInvoices(invoices);
    return ApiResponse.success(
      { generated: created.length },
      `${created.length} invoices generated`,
    );
  }

  async findAllInvoices(
    tenantId: string,
    query: InvoiceQueryDto,
  ): Promise<ApiResponse<FeeInvoiceDocument[]>> {
    const filter: FilterQuery<FeeInvoiceDocument> = { tenantId };

    if (query.studentId) filter.studentId = query.studentId;
    if (query.status) filter.status = query.status;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.term) filter.term = query.term;
    if (query.search) {
      filter.invoiceNumber = { $regex: query.search, $options: "i" };
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.financeRepository.findAllInvoices(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Invoices retrieved", meta);
  }

  async findInvoiceById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<FeeInvoiceDocument>> {
    const invoice = await this.financeRepository.findInvoiceById(id);
    if (!invoice || invoice.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Invoice not found");
    }
    return ApiResponse.success(invoice, "Invoice retrieved");
  }

  async applyDiscount(
    id: string,
    tenantId: string,
    dto: ApplyDiscountDto,
  ): Promise<ApiResponse<FeeInvoiceDocument>> {
    const invoice = await this.financeRepository.findInvoiceById(id);
    if (!invoice || invoice.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Invoice not found");
    }

    const newBalance = invoice.totalAmount - invoice.paidAmount - dto.discount;
    const updated = await this.financeRepository.updateInvoice(id, {
      discount: dto.discount,
      discountReason: dto.reason,
      balance: Math.max(0, newBalance),
      status: newBalance <= 0 ? InvoiceStatus.PAID : invoice.status,
    });

    return ApiResponse.success(updated, "Discount applied");
  }

  // ---- Payments ----
  async recordPayment(
    tenantId: string,
    dto: RecordPaymentDto,
    receivedById: string,
  ): Promise<ApiResponse<FeePaymentDocument>> {
    const invoice = await this.financeRepository.findInvoiceById(dto.invoiceId);
    if (!invoice || invoice.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException("Cannot pay a cancelled invoice");
    }

    if (dto.amount > invoice.balance) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds balance (${invoice.balance})`,
      );
    }

    const receiptNumber =
      await this.financeRepository.getNextReceiptNumber(tenantId);

    const payment = await this.financeRepository.createPayment({
      tenantId: tenantId as any,
      receiptNumber,
      invoiceId: dto.invoiceId as any,
      studentId: (invoice.studentId as any)._id || invoice.studentId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      mpesaTransactionId: dto.mpesaTransactionId,
      mpesaPhoneNumber: dto.mpesaPhoneNumber,
      bankReference: dto.bankReference,
      chequeNumber: dto.chequeNumber,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
      description: dto.description,
      receivedById: receivedById as any,
    });

    // Update invoice
    const newPaidAmount = invoice.paidAmount + dto.amount;
    const newBalance =
      invoice.totalAmount - newPaidAmount - (invoice.discount || 0);
    const newStatus =
      newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    await this.financeRepository.updateInvoice(dto.invoiceId, {
      paidAmount: newPaidAmount,
      balance: Math.max(0, newBalance),
      status: newStatus,
    });

    return ApiResponse.success(payment, "Payment recorded successfully");
  }

  async findAllPayments(
    tenantId: string,
    query: PaymentQueryDto,
  ): Promise<ApiResponse<FeePaymentDocument[]>> {
    const filter: FilterQuery<FeePaymentDocument> = { tenantId };

    if (query.studentId) filter.studentId = query.studentId;
    if (query.invoiceId) filter.invoiceId = query.invoiceId;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.dateFrom || query.dateTo) {
      filter.paymentDate = {};
      if (query.dateFrom) filter.paymentDate.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.paymentDate.$lte = new Date(query.dateTo);
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.financeRepository.findAllPayments(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Payments retrieved", meta);
  }

  async getFinanceSummary(tenantId: string): Promise<ApiResponse<any>> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [totalCollections, outstandingBalance] = await Promise.all([
      this.financeRepository.getTotalCollections(tenantId, startOfYear, now),
      this.financeRepository.getOutstandingBalance(tenantId),
    ]);

    return ApiResponse.success(
      {
        totalCollections,
        outstandingBalance,
        year: now.getFullYear(),
      },
      "Finance summary retrieved",
    );
  }
}
