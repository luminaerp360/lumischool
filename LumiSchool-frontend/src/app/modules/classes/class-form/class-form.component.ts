import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-class-form",
  templateUrl: "./class-form.component.html",
  styleUrls: ["./class-form.component.scss"],
})
export class ClassFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  classId: string | null = null;
  loading = false;
  loadingClass = false;
  error = "";

  readonly levels = [
    { value: "PRE_PRIMARY", label: "Pre-Primary", grades: [1, 2] },
    { value: "PRIMARY", label: "Primary", grades: [1, 2, 3, 4, 5, 6] },
    { value: "JSS", label: "Junior Secondary", grades: [7, 8, 9] },
    { value: "SENIOR", label: "Senior Secondary", grades: [10, 11, 12] },
  ];

  readonly categories = [
    { value: "REGULAR", label: "Regular" },
    { value: "SPECIAL_NEEDS_UNIT", label: "Special Needs Unit" },
    { value: "MULTI_GRADE", label: "Multi-Grade" },
    { value: "ADULT_EDUCATION", label: "Adult Education" },
  ];

  readonly cbcTracks = [
    { value: "", label: "Not applicable" },
    { value: "STEM", label: "STEM" },
    { value: "SOCIAL_SCIENCES", label: "Social Sciences" },
    { value: "ARTS_AND_SPORTS", label: "Arts & Sports" },
  ];

  readonly statuses = [
    { value: "ACTIVE", label: "Active" },
    { value: "FULL", label: "Full" },
    { value: "PROVISIONAL", label: "Provisional" },
  ];

  gradesForLevel: number[] = [];
  currentYear = new Date().getFullYear();
  academicYearOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classesService: ClassesService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.buildAcademicYears();
    this.buildForm();

    this.classId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.classId;
    if (this.isEditMode && this.classId) {
      this.loadClass(this.classId);
    }

    this.form.get("level")!.valueChanges.subscribe((level) => {
      this.updateGrades(level);
      this.form.get("grade")!.reset();
    });
  }

  buildAcademicYears(): void {
    const y = this.currentYear;
    this.academicYearOptions = [`${y - 1}`, `${y}`, `${y + 1}`];
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ["", Validators.required],
      level: ["", Validators.required],
      grade: ["", Validators.required],
      academicYear: [String(this.currentYear), Validators.required],
      capacity: [45, [Validators.required, Validators.min(1)]],
      classTeacherId: [""],
      assistantTeacherId: [""],
      room: [""],
      block: [""],
      category: ["REGULAR"],
      cbcTrack: [""],
      isExamCenter: [false],
      isMultiGrade: [false],
      status: ["ACTIVE"],
    });
  }

  updateGrades(level: string): void {
    const found = this.levels.find((l) => l.value === level);
    this.gradesForLevel = found ? found.grades : [];
  }

  loadClass(id: string): void {
    this.loadingClass = true;
    this.classesService.getById(id).subscribe({
      next: (res) => {
        const c = res.data;
        this.updateGrades(c.level);
        const teacherId =
          typeof c.classTeacherId === "object"
            ? (c.classTeacherId as any)?._id
            : c.classTeacherId;
        const assistantId =
          typeof c.assistantTeacherId === "object"
            ? (c.assistantTeacherId as any)?._id
            : c.assistantTeacherId;
        this.form.patchValue({
          name: c.name,
          level: c.level,
          grade: c.grade,
          academicYear: c.academicYear,
          capacity: c.capacity,
          classTeacherId: teacherId || "",
          assistantTeacherId: assistantId || "",
          room: c.room || "",
          block: c.block || "",
          category: c.category || "REGULAR",
          cbcTrack: c.cbcTrack || "",
          isExamCenter: c.isExamCenter || false,
          isMultiGrade: c.isMultiGrade || false,
          status: c.status || "ACTIVE",
        });
        this.loadingClass = false;
      },
      error: () => {
        this.loadingClass = false;
        this.router.navigate(["/classes"]);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";

    const raw = this.form.value;
    const payload: any = {
      name: raw.name,
      level: raw.level,
      grade: Number(raw.grade),
      academicYear: raw.academicYear,
      capacity: Number(raw.capacity),
    };

    if (raw.classTeacherId) payload.classTeacherId = raw.classTeacherId;
    if (raw.assistantTeacherId)
      payload.assistantTeacherId = raw.assistantTeacherId;
    if (raw.room) payload.room = raw.room;
    if (raw.block) payload.block = raw.block;
    if (raw.category && raw.category !== "REGULAR")
      payload.category = raw.category;
    if (raw.cbcTrack) payload.cbcTrack = raw.cbcTrack;
    if (raw.isExamCenter) payload.isExamCenter = raw.isExamCenter;
    if (raw.isMultiGrade) payload.isMultiGrade = raw.isMultiGrade;
    if (this.isEditMode && raw.status) payload.status = raw.status;

    const action$ = this.isEditMode
      ? this.classesService.update(this.classId!, payload)
      : this.classesService.create(payload);

    action$.subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(["/classes", res.data._id]);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message || "An error occurred. Please try again.";
      },
    });
  }

  cancel(): void {
    if (this.isEditMode && this.classId) {
      this.router.navigate(["/classes", this.classId]);
    } else {
      this.router.navigate(["/classes"]);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
