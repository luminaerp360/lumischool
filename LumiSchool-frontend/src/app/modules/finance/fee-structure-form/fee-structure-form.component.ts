import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { FinanceService } from "../../../shared/services/finance/finance.service";
import { FeeStructure, SchoolLevel } from "../../../shared/interfaces/models";

export const FEE_CATEGORIES = [
  { value: "TUITION", label: "Tuition / School Fees" },
  { value: "BOARDING", label: "Boarding" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "UNIFORM", label: "Uniform" },
  { value: "BOOKS", label: "Books & Stationery" },
  { value: "EXAM", label: "Examination" },
  { value: "ACTIVITY", label: "Activity / Co-curricular" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DEVELOPMENT", label: "Development Levy" },
  { value: "OTHER", label: "Other" },
];

export const SCHOOL_LEVELS: { value: SchoolLevel; label: string }[] = [
  { value: "PRE_PRIMARY", label: "Pre-Primary (PP1-PP2)" },
  { value: "PRIMARY", label: "Primary (Grade 1-6)" },
  { value: "JSS", label: "Junior Secondary (Grade 7-9)" },
  { value: "SENIOR", label: "Senior Secondary (Grade 10-12)" },
];

@Component({
  selector: "app-fee-structure-form",
  templateUrl: "./fee-structure-form.component.html",
  styleUrls: ["./fee-structure-form.component.scss"],
})
export class FeeStructureFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  loadingData = false;
  error = "";

  readonly feeCategories = FEE_CATEGORIES;
  readonly schoolLevels = SCHOOL_LEVELS;
  readonly terms = ["Term 1", "Term 2", "Term 3"];
  readonly currentYear = new Date().getFullYear();
  readonly academicYears = [
    String(this.currentYear - 1),
    String(this.currentYear),
    String(this.currentYear + 1),
  ];

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", Validators.required],
      academicYear: [String(this.currentYear), Validators.required],
      term: ["Term 1", Validators.required],
      level: ["PRIMARY", Validators.required],
      grade: [null],
      items: this.fb.array([this.newItem()]),
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEdit = true;
      this.loadingData = true;
      // Load all structures and find the matching one by _id (no single-get endpoint)
      this.financeService.getFeeStructures({}).subscribe({
        next: (res) => {
          const raw = (res.data as any).data ?? res.data;
          const list: FeeStructure[] = Array.isArray(raw) ? raw : [];
          const s = list.find((item) => item._id === id);
          if (s) {
            this.form.patchValue({
              name: s.name,
              academicYear: s.academicYear,
              term: s.term,
              level: s.level,
              grade: s.grade ?? null,
            });
            // Restore items
            this.items.clear();
            s.items.forEach((item) => {
              this.items.push(
                this.fb.group({
                  category: [item.category, Validators.required],
                  description: [item.description, Validators.required],
                  amount: [
                    item.amount,
                    [Validators.required, Validators.min(0)],
                  ],
                  isOptional: [item.isOptional ?? false],
                }),
              );
            });
          }
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
        },
      });
    }
  }

  get items(): FormArray {
    return this.form.get("items") as FormArray;
  }

  newItem(): FormGroup {
    return this.fb.group({
      category: ["TUITION", Validators.required],
      description: ["", Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      isOptional: [false],
    });
  }

  addItem(): void {
    this.items.push(this.newItem());
  }

  removeItem(i: number): void {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  get totalAmount(): number {
    return this.items.controls.reduce(
      (sum, c) => sum + (Number(c.get("amount")?.value) || 0),
      0,
    );
  }

  categoryLabel(value: string): string {
    return this.feeCategories.find((c) => c.value === value)?.label ?? value;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";
    const val = this.form.value;
    const payload: any = {
      name: val.name.trim(),
      academicYear: val.academicYear,
      term: val.term,
      level: val.level,
      items: val.items,
    };
    if (val.grade) payload.grade = Number(val.grade);

    const id = this.route.snapshot.paramMap.get("id");
    const req$ = this.isEdit
      ? this.financeService.updateFeeStructure(id!, payload)
      : this.financeService.createFeeStructure(payload);

    req$.subscribe({
      next: () => {
        this.router.navigate(["/finance"]);
      },
      error: (err) => {
        this.error = err?.error?.message ?? "Failed to save fee structure.";
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(["/finance"]);
  }
}
