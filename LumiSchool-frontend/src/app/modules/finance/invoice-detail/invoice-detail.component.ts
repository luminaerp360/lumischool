import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { FinanceService } from "../../../shared/services/finance/finance.service";
import { FeeInvoice, FeePayment } from "../../../shared/interfaces/models";

export const PAYMENT_METHODS = [
  { value: "MPESA", label: "M-Pesa", color: "green" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", color: "blue" },
  { value: "CASH", label: "Cash", color: "yellow" },
  { value: "CHEQUE", label: "Cheque", color: "purple" },
  { value: "BURSARY", label: "Bursary", color: "orange" },
  { value: "SCHOLARSHIP", label: "Scholarship", color: "indigo" },
];

@Component({
  selector: "app-invoice-detail",
  templateUrl: "./invoice-detail.component.html",
  styleUrls: ["./invoice-detail.component.scss"],
})
export class InvoiceDetailComponent implements OnInit {
  invoice: FeeInvoice | null = null;
  payments: FeePayment[] = [];
  loading = true;
  error = "";

  // Payment form
  showPaymentForm = false;
  paymentForm!: FormGroup;
  savingPayment = false;
  paymentError = "";

  // Discount form
  showDiscountForm = false;
  discountForm!: FormGroup;
  savingDiscount = false;
  discountError = "";

  readonly paymentMethods = PAYMENT_METHODS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private financeService: FinanceService,
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      paymentMethod: ["MPESA", Validators.required],
      mpesaTransactionId: [""],
      mpesaPhoneNumber: [""],
      bankReference: [""],
      chequeNumber: [""],
      paymentDate: [new Date().toISOString().split("T")[0]],
    });

    this.discountForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      reason: ["", Validators.required],
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (id) this.loadData(id);
  }

  loadData(id: string): void {
    this.loading = true;
    forkJoin([
      this.financeService.getInvoiceById(id),
      this.financeService.getPayments({ invoiceId: id }),
    ]).subscribe({
      next: ([invRes, payRes]) => {
        this.invoice = invRes.data as FeeInvoice;
        const raw = (payRes.data as any).data ?? payRes.data;
        this.payments = Array.isArray(raw) ? raw : [];
        this.loading = false;
        // Pre-fill payment amount as remaining balance
        if (this.invoice) {
          this.paymentForm.patchValue({ amount: this.invoice.balance });
        }
      },
      error: () => {
        this.error = "Failed to load invoice.";
        this.loading = false;
      },
    });
  }

  studentName(inv: FeeInvoice): string {
    const s = inv.studentId as any;
    if (s && typeof s === "object")
      return `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
    return String(s ?? "Unknown");
  }

  get selectedMethod(): string {
    return this.paymentForm.get("paymentMethod")?.value ?? "";
  }

  get statusClass(): string {
    return this.getStatusClass(this.invoice?.status ?? "");
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "OVERDUE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "SENT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 line-through";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  }

  methodLabel(value: string): string {
    return this.paymentMethods.find((m) => m.value === value)?.label ?? value;
  }

  methodClass(value: string): string {
    switch (value) {
      case "MPESA":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "BANK_TRANSFER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "CASH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "CHEQUE":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "BURSARY":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "SCHOLARSHIP":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  }

  canRecord(): boolean {
    return !["PAID", "CANCELLED"].includes(this.invoice?.status ?? "");
  }

  canDiscount(): boolean {
    return !["PAID", "CANCELLED"].includes(this.invoice?.status ?? "");
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.savingPayment = true;
    this.paymentError = "";
    const val = this.paymentForm.value;
    const payload: any = {
      invoiceId: this.invoice?._id,
      amount: Number(val.amount),
      paymentMethod: val.paymentMethod,
      paymentDate: val.paymentDate || undefined,
    };
    if (val.paymentMethod === "MPESA") {
      if (val.mpesaTransactionId)
        payload.mpesaTransactionId = val.mpesaTransactionId;
      if (val.mpesaPhoneNumber) payload.mpesaPhoneNumber = val.mpesaPhoneNumber;
    }
    if (val.paymentMethod === "BANK_TRANSFER" && val.bankReference)
      payload.bankReference = val.bankReference;
    if (val.paymentMethod === "CHEQUE" && val.chequeNumber)
      payload.chequeNumber = val.chequeNumber;

    this.financeService.recordPayment(payload).subscribe({
      next: () => {
        this.showPaymentForm = false;
        this.savingPayment = false;
        const id = this.route.snapshot.paramMap.get("id");
        if (id) this.loadData(id);
      },
      error: (err) => {
        this.paymentError = err?.error?.message ?? "Failed to record payment.";
        this.savingPayment = false;
      },
    });
  }

  submitDiscount(): void {
    if (this.discountForm.invalid) {
      this.discountForm.markAllAsTouched();
      return;
    }
    this.savingDiscount = true;
    this.discountError = "";
    const val = this.discountForm.value;
    this.financeService
      .applyDiscount(this.invoice!._id as string, {
        amount: Number(val.amount),
        reason: val.reason.trim(),
      })
      .subscribe({
        next: () => {
          this.showDiscountForm = false;
          this.savingDiscount = false;
          const id = this.route.snapshot.paramMap.get("id");
          if (id) this.loadData(id);
        },
        error: (err) => {
          this.discountError =
            err?.error?.message ?? "Failed to apply discount.";
          this.savingDiscount = false;
        },
      });
  }

  back(): void {
    this.router.navigate(["/finance"]);
  }
}
