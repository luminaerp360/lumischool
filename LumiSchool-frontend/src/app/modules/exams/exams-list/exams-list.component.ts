import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ExamsService } from "../../../shared/services/exams/exams.service";
import { Exam, ExamType } from "../../../shared/interfaces/models";
import { EXAM_TYPE_META } from "../exam-form/exam-form.component";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-exams-list",
  templateUrl: "./exams-list.component.html",
  styleUrls: ["./exams-list.component.scss"],
})
export class ExamsListComponent implements OnInit {
  exams: Exam[] = [];
  loading = true;
  search = "";
  filterType = "";
  filterTerm = "";
  filterYear = "";

  readonly currentYear = new Date().getFullYear();
  readonly academicYears = [
    "",
    String(this.currentYear - 1),
    String(this.currentYear),
    String(this.currentYear + 1),
  ];
  readonly terms = ["", "Term 1", "Term 2", "Term 3"];
  readonly examTypes: { value: ExamType | ""; label: string }[] = [
    { value: "", label: "All Types" },
    { value: "CAT", label: "CAT" },
    { value: "MID_TERM", label: "Mid-Term" },
    { value: "END_TERM", label: "End-of-Term" },
    { value: "MOCK", label: "Mock" },
    { value: "NATIONAL", label: "National" },
    { value: "ASSIGNMENT", label: "Assignment" },
  ];
  readonly examTypeMeta = EXAM_TYPE_META;

  constructor(
    private examsService: ExamsService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  get totalExams(): number {
    return this.exams.length;
  }

  get publishedCount(): number {
    return this.exams.filter((e) => e.isPublished).length;
  }

  get draftCount(): number {
    return this.exams.filter((e) => !e.isPublished).length;
  }

  get catCount(): number {
    return this.exams.filter((e) => e.type === "CAT").length;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const params: Record<string, any> = { search: this.search };
    if (this.filterType) params["type"] = this.filterType;
    if (this.filterTerm) params["term"] = this.filterTerm;
    if (this.filterYear) params["academicYear"] = this.filterYear;
    this.examsService.getAll(params).subscribe({
      next: (res) => {
        this.exams = (res.data as any).data ?? res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  createExam(): void {
    this.router.navigate(["/exams/new"]);
  }

  view(id: string): void {
    this.router.navigate(["/exams", id]);
  }

  edit(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(["/exams", id, "edit"]);
  }

  typeClass(type: ExamType): string {
    return this.examTypeMeta[type]?.color || "";
  }

  typeLabel(type: ExamType): string {
    return this.examTypeMeta[type]?.label || type;
  }
}
