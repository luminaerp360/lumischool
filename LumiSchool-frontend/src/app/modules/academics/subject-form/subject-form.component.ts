import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AcademicsService } from "../../../shared/services/academics/academics.service";
import {
  SubjectCategory,
  SchoolLevel,
} from "../../../shared/interfaces/models";

// Kenya CBC levels with their curriculum context
export const CBC_LEVELS: {
  value: SchoolLevel;
  label: string;
  grades: string;
}[] = [
  {
    value: "PRE_PRIMARY",
    label: "Pre-Primary",
    grades: "PP1 – PP2",
  },
  {
    value: "PRIMARY",
    label: "Lower & Upper Primary",
    grades: "Grade 1 – 6",
  },
  {
    value: "JSS",
    label: "Junior Secondary (JSS)",
    grades: "Grade 7 – 9",
  },
  {
    value: "SENIOR",
    label: "Senior Secondary",
    grades: "Grade 10 – 12",
  },
];

// CBC core subjects by level (for guidance panel)
export const CBC_SUBJECTS: Record<SchoolLevel, string[]> = {
  PRE_PRIMARY: [
    "Language Activities",
    "Mathematical Activities",
    "Environmental Activities",
    "Psychomotor & Creative Activities",
    "Religious Education Activities",
  ],
  PRIMARY: [
    "English",
    "Kiswahili / KSL",
    "Mathematics",
    "Integrated Science",
    "Social Studies",
    "Religious Education (CRE/IRE/HRE)",
    "Creative Arts & Sports",
    "Agriculture & Nutrition",
    "Pre-Technical & Pre-Career Education",
  ],
  JSS: [
    "English",
    "Kiswahili",
    "Mathematics",
    "Integrated Science",
    "Social Studies",
    "Religious Education (CRE/IRE/HRE)",
    "Creative Arts & Sports",
    "Agriculture",
    "Business Studies",
    "Pre-Technical Studies",
    "Computer Science",
    "Life Skills Education",
  ],
  SENIOR: [
    "English",
    "Kiswahili",
    "Mathematics (Core / Alt.)",
    "Pathway subjects (STEM / Arts & Sports / Social Sciences / Technical)",
  ],
};

import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-subject-form",
  templateUrl: "./subject-form.component.html",
  styleUrls: ["./subject-form.component.scss"],
})
export class SubjectFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  subjectId: string | null = null;
  loading = false;
  loadingData = false;
  error = "";

  readonly cbcLevels = CBC_LEVELS;
  readonly cbcSubjects = CBC_SUBJECTS;

  readonly categories: { value: SubjectCategory; label: string }[] = [
    { value: "CORE", label: "Core" },
    { value: "ELECTIVE", label: "Elective" },
    { value: "OPTIONAL", label: "Optional" },
    { value: "CO_CURRICULAR", label: "Co-curricular" },
  ];

  guidanceLevel: SchoolLevel | null = null;

  constructor(
    private fb: FormBuilder,
    private academicsService: AcademicsService,
    private route: ActivatedRoute,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", Validators.required],
      code: ["", [Validators.required, Validators.pattern(/^[A-Za-z0-9_]+$/)]],
      category: ["CORE"],
      applicableLevels: [[]],
      description: [""],
    });

    this.subjectId = this.route.snapshot.paramMap.get("id");
    if (this.subjectId) {
      this.isEdit = true;
      this.loadSubject(this.subjectId);
    }
  }

  loadSubject(id: string): void {
    this.loadingData = true;
    this.academicsService.getSubjectById(id).subscribe({
      next: (res) => {
        const s = res.data;
        this.form.patchValue({
          name: s.name,
          code: s.code,
          category: s.category,
          applicableLevels: s.applicableLevels || [],
          description: s.description || "",
        });
        this.loadingData = false;
      },
      error: () => {
        this.loadingData = false;
        this.error = "Failed to load subject.";
      },
    });
  }

  isLevelChecked(level: SchoolLevel): boolean {
    return (this.form.value.applicableLevels as SchoolLevel[]).includes(level);
  }

  isLevelSelected(level: SchoolLevel): boolean {
    return this.isLevelChecked(level);
  }

  toggleLevel(level: SchoolLevel): void {
    const current: SchoolLevel[] = [...this.form.value.applicableLevels];
    const idx = current.indexOf(level);
    if (idx > -1) {
      current.splice(idx, 1);
      if (this.guidanceLevel === level) this.guidanceLevel = null;
    } else {
      current.push(level);
      this.guidanceLevel = level;
    }
    this.form.patchValue({ applicableLevels: current });
  }

  onCodeInput(): void {
    const val: string = this.form.get("code")?.value || "";
    this.form.get("code")?.setValue(val.toUpperCase(), { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";
    const payload = this.form.value;

    const request = this.isEdit
      ? this.academicsService.updateSubject(this.subjectId!, payload)
      : this.academicsService.createSubject(payload);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/academics"]);
      },
      error: (err) => {
        this.error =
          err?.error?.message || "Failed to save subject. Please try again.";
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(["/academics"]);
  }
}
