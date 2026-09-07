import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FinanceService } from "../../../shared/services/finance/finance.service";
import { StudentsService } from "../../../shared/services/students/students.service";
import {
  FeeInvoice,
  FeePayment,
  FeeStructure,
  Student,
} from "../../../shared/interfaces/models";

@Component({
  selector: "app-finance-list",
  templateUrl: "./finance-list.component.html",
  styleUrls: ["./finance-list.component.scss"],
})
export class FinanceListComponent implements OnInit {
  tab: "invoices" | "payments" | "structures" = "invoices";

  feeStructures: FeeStructure[] = [];
  invoices: FeeInvoice[] = [];
  payments: FeePayment[] = [];
  loading = true;

  // Summary stats
  summary: {
    totalBilled?: number;
    totalCollected?: number;
    totalOutstanding?: number;
    overdueCount?: number;
  } = {};

  // Filters
  filterStatus = "";
  filterTerm = "";
  filterYear = String(new Date().getFullYear());
  filterLevel = "";

  // Generate invoices modal
  showGenerateModal = false;
  genStructureId = "";
  genDueDate = "";
  generating = false;
  generateError = "";
  genStudents: Student[] = [];
  genSelectedIds = new Set<string>();
  genStudentSearch = "";
  loadingStudents = false;

  readonly currentYear = new Date().getFullYear();
  readonly academicYears = [
    String(this.currentYear - 1),
    String(this.currentYear),
    String(this.currentYear + 1),
  ];
  readonly terms = ["Term 1", "Term 2", "Term 3"];
  readonly invoiceStatuses = [
    { value: "", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "SENT", label: "Sent" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "PAID", label: "Paid" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "CANCELLED", label: "Cancelled" },
  ];
  readonly schoolLevels = [
    { value: "", label: "All Levels" },
    { value: "PRE_PRIMARY", label: "Pre-Primary" },
    { value: "PRIMARY", label: "Primary" },
    { value: "JSS", label: "Junior Secondary" },
    { value: "SENIOR", label: "Senior Secondary" },
  ];

  constructor(
    private financeService: FinanceService,
    private studentsService: StudentsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTab();
  }

  loadSummary(): void {
    this.financeService.getSummary().subscribe({
      next: (res) => {
        this.summary = (res.data as any) ?? {};
      },
    });
  }

  loadTab(): void {
    this.loading = true;
    if (this.tab === "structures") {
      const params: Record<string, any> = {};
      if (this.filterYear) params["academicYear"] = this.filterYear;
      if (this.filterTerm) params["term"] = this.filterTerm;
      if (this.filterLevel) params["level"] = this.filterLevel;
      this.financeService.getFeeStructures(params).subscribe({
        next: (res) => {
          const raw = (res.data as any).data ?? res.data;
          this.feeStructures = Array.isArray(raw) ? raw : [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else if (this.tab === "invoices") {
      const params: Record<string, any> = {};
      if (this.filterStatus) params["status"] = this.filterStatus;
      if (this.filterTerm) params["term"] = this.filterTerm;
      if (this.filterYear) params["academicYear"] = this.filterYear;
      this.financeService.getInvoices(params).subscribe({
        next: (res) => {
          const raw = (res.data as any).data ?? res.data;
          this.invoices = Array.isArray(raw) ? raw : [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.financeService.getPayments().subscribe({
        next: (res) => {
          const raw = (res.data as any).data ?? res.data;
          this.payments = Array.isArray(raw) ? raw : [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  switchTab(t: "invoices" | "payments" | "structures"): void {
    this.tab = t;
    this.filterStatus = "";
    this.loadTab();
  }

  applyFilters(): void {
    this.loadTab();
  }

  // Navigation
  viewInvoice(id: string): void {
    this.router.navigate(["/finance/invoices", id]);
  }

  editStructure(id: string): void {
    this.router.navigate(["/finance/fee-structures", id, "edit"]);
  }

  createStructure(): void {
    this.router.navigate(["/finance/fee-structures/new"]);
  }

  // Generate invoices
  openGenerateModal(structureId: string): void {
    const structure = this.feeStructures.find((s) => s._id === structureId);
    this.genStructureId = structureId;
    this.genDueDate = "";
    this.generateError = "";
    this.genStudents = [];
    this.genSelectedIds = new Set();
    this.genStudentSearch = "";
    this.showGenerateModal = true;
    this.loadingStudents = true;
    const params: Record<string, any> = {};
    if (structure?.level) params["level"] = structure.level;
    if (structure?.grade) params["grade"] = String(structure.grade);
    this.studentsService.getAll(params).subscribe({
      next: (res) => {
        const raw = (res.data as any).data ?? res.data;
        this.genStudents = Array.isArray(raw) ? raw : [];
        // Pre-select all by default
        this.genStudents.forEach((s) => this.genSelectedIds.add(s._id));
        this.loadingStudents = false;
      },
      error: () => {
        this.loadingStudents = false;
      },
    });
  }

  get filteredGenStudents(): Student[] {
    const q = this.genStudentSearch.toLowerCase();
    if (!q) return this.genStudents;
    return this.genStudents.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.admissionNumber}`
        .toLowerCase()
        .includes(q),
    );
  }

  toggleGenStudent(id: string): void {
    if (this.genSelectedIds.has(id)) this.genSelectedIds.delete(id);
    else this.genSelectedIds.add(id);
  }

  toggleSelectAll(): void {
    if (this.genSelectedIds.size === this.genStudents.length) {
      this.genSelectedIds.clear();
    } else {
      this.genStudents.forEach((s) => this.genSelectedIds.add(s._id));
    }
  }

  confirmGenerate(): void {
    if (!this.genStructureId) return;
    if (this.genSelectedIds.size === 0) {
      this.generateError = "Please select at least one student.";
      return;
    }
    this.generating = true;
    this.generateError = "";
    const payload: any = {
      feeStructureId: this.genStructureId,
      studentIds: Array.from(this.genSelectedIds),
    };
    if (this.genDueDate) payload.dueDate = this.genDueDate;
    this.financeService.generateInvoices(payload).subscribe({
      next: () => {
        this.showGenerateModal = false;
        this.generating = false;
        this.tab = "invoices";
        this.loadTab();
        this.loadSummary();
      },
      error: (err) => {
        this.generateError =
          err?.error?.message ?? "Failed to generate invoices.";
        this.generating = false;
      },
    });
  }

  // Display helpers
  studentName(inv: FeeInvoice): string {
    return this.studentNameFromRaw(inv.studentId);
  }

  studentNameFromRaw(raw: any): string {
    if (raw && typeof raw === "object")
      return `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim();
    return String(raw ?? "—");
  }

  methodLabel(value: string): string {
    const map: Record<string, string> = {
      MPESA: "M-Pesa",
      BANK_TRANSFER: "Bank Transfer",
      CASH: "Cash",
      CHEQUE: "Cheque",
      BURSARY: "Bursary",
      SCHOLARSHIP: "Scholarship",
    };
    return map[value] ?? value;
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

  statusClass(status: string): string {
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
        return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  }

  // Keep for backward compat
  getInvoiceStatusClass(status: string): string {
    return this.statusClass(status);
  }

  getPaymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: "badge-pending",
      COMPLETED: "badge-completed",
      FAILED: "badge-failed",
      REFUNDED: "badge-refunded",
    };
    return map[status] || "badge-draft";
  }
}
