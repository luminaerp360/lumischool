import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ExamsService } from "../../../shared/services/exams/exams.service";
import { Exam, ExamType } from "../../../shared/interfaces/models";
import { EXAM_TYPE_META } from "../exam-form/exam-form.component";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-exam-detail",
  templateUrl: "./exam-detail.component.html",
  styleUrls: ["./exam-detail.component.scss"],
})
export class ExamDetailComponent implements OnInit {
  exam: Exam | null = null;
  loading = true;
  publishing = false;

  readonly examTypeMeta = EXAM_TYPE_META;

  constructor(
    private examsService: ExamsService,
    private route: ActivatedRoute,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.examsService.getById(id).subscribe({
        next: (res) => {
          this.exam = res.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  publish(): void {
    if (!this.exam || this.exam.isPublished) return;
    if (
      !confirm(
        "Publish results for this exam? Students and parents will be able to view them.",
      )
    )
      return;
    this.publishing = true;
    this.examsService.publish(this.exam._id).subscribe({
      next: (res) => {
        this.exam = res.data;
        this.publishing = false;
      },
      error: () => {
        this.publishing = false;
      },
    });
  }

  editExam(): void {
    if (this.exam) {
      this.router.navigate(["/exams", this.exam._id, "edit"]);
    }
  }

  goBack(): void {
    this.router.navigate(["/exams"]);
  }

  get typeMeta() {
    if (!this.exam) return null;
    return EXAM_TYPE_META[this.exam.type as ExamType];
  }

  className(val: any): string {
    if (val && typeof val === "object") return val.name ?? val._id;
    return val;
  }

  subjectName(val: any): string {
    if (val && typeof val === "object")
      return val.name + (val.code ? ` (${val.code})` : "");
    return val;
  }

  formatDate(d?: string): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
}
