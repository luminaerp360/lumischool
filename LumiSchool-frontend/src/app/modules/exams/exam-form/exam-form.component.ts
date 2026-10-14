import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { ExamsService } from "../../../shared/services/exams/exams.service";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { AcademicsService } from "../../../shared/services/academics/academics.service";
import {
  ExamType,
  SchoolClass,
  Subject,
} from "../../../shared/interfaces/models";

export const EXAM_TYPE_META: Record<
  ExamType,
  { label: string; hint: string; color: string }
> = {
  CAT: {
    label: "CAT",
    hint: "Continuous Assessment Test — short in-class test, typically 30 marks. Counts 30% toward term grade in CBC.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  MID_TERM: {
    label: "Mid-Term Exam",
    hint: "Sit-down exam at the midpoint of a term. Covers work done in first half of the term.",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  END_TERM: {
    label: "End-of-Term Exam",
    hint: "Main summative exam at end of term. Counts 70% toward the term grade in CBC.",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  MOCK: {
    label: "Mock Exam",
    hint: "Practice exam for national assessments (KJSEA / KCSE). Full paper under exam conditions.",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  NATIONAL: {
    label: "National Exam",
    hint: "Official national assessment: KPLEA (Grade 6), KJSEA (Grade 9), or KCSE (Grade 12).",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  ASSIGNMENT: {
    label: "Assignment / Project",
    hint: "Take-home assignment, project, or oral assessment.",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-exam-form",
  templateUrl: "./exam-form.component.html",
  styleUrls: ["./exam-form.component.scss"],
})
export class ExamFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  examId: string | null = null;
  loading = false;
  loadingData = false;
  error = "";

  classes: SchoolClass[] = [];
  subjects: Subject[] = [];

  readonly examTypes = Object.keys(EXAM_TYPE_META) as ExamType[];
  readonly examTypeMeta = EXAM_TYPE_META;
  readonly terms = ["Term 1", "Term 2", "Term 3"];
  readonly currentYear = new Date().getFullYear();
  readonly academicYears = [
    String(this.currentYear - 1),
    String(this.currentYear),
    String(this.currentYear + 1),
  ];

  constructor(
    private fb: FormBuilder,
    private examsService: ExamsService,
    private classesService: ClassesService,
    private academicsService: AcademicsService,
    private route: ActivatedRoute,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", Validators.required],
      type: ["END_TERM", Validators.required],
      academicYear: [String(this.currentYear), Validators.required],
      term: ["Term 1", Validators.required],
      startDate: [""],
      endDate: [""],
      totalMarks: [100, [Validators.required, Validators.min(1)]],
      classIds: [[]],
      subjectIds: [[]],
    });

    this.loadingData = true;
    forkJoin({
      classes: this.classesService.getAll({ limit: 100 }),
      subjects: this.academicsService.getSubjects({ limit: 100 }),
    }).subscribe({
      next: ({ classes, subjects }) => {
        this.classes = classes.data || [];
        this.subjects = subjects.data || [];
        this.loadingData = false;
      },
      error: () => {
        this.loadingData = false;
      },
    });

    this.examId = this.route.snapshot.paramMap.get("id");
    if (this.examId) {
      this.isEdit = true;
      this.loadExam(this.examId);
    }
  }

  loadExam(id: string): void {
    this.examsService.getById(id).subscribe({
      next: (res) => {
        const e = res.data;
        this.form.patchValue({
          name: e.name,
          type: e.type,
          academicYear: e.academicYear,
          term: e.term,
          startDate: e.startDate ? e.startDate.substring(0, 10) : "",
          endDate: e.endDate ? e.endDate.substring(0, 10) : "",
          totalMarks: e.totalMarks,
          classIds: e.classIds || [],
          subjectIds: e.subjectIds || [],
        });
      },
      error: () => {
        this.error = "Failed to load exam.";
      },
    });
  }

  isClassSelected(id: string): boolean {
    return (this.form.value.classIds as string[]).includes(id);
  }

  toggleClass(id: string): void {
    const current: string[] = [...this.form.value.classIds];
    const idx = current.indexOf(id);
    if (idx > -1) current.splice(idx, 1);
    else current.push(id);
    this.form.patchValue({ classIds: current });
  }

  isSubjectSelected(id: string): boolean {
    return (this.form.value.subjectIds as string[]).includes(id);
  }

  toggleSubject(id: string): void {
    const current: string[] = [...this.form.value.subjectIds];
    const idx = current.indexOf(id);
    if (idx > -1) current.splice(idx, 1);
    else current.push(id);
    this.form.patchValue({ subjectIds: current });
  }

  classLabel(c: SchoolClass): string {
    return `${c.name} (${c.level} · ${c.academicYear})`;
  }

  get selectedTypeMeta() {
    return EXAM_TYPE_META[this.form.value.type as ExamType];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";
    const payload = { ...this.form.value };
    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;

    const request = this.isEdit
      ? this.examsService.update(this.examId!, payload)
      : this.examsService.create(payload);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/exams"]);
      },
      error: (err) => {
        this.error =
          err?.error?.message || "Failed to save exam. Please try again.";
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(["/exams"]);
  }
}
