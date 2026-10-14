import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StudentsService } from "../../../shared/services/students/students.service";
import { Student } from "../../../shared/interfaces/models";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-student-detail",
  templateUrl: "./student-detail.component.html",
  styleUrls: ["./student-detail.component.scss"],
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.studentsService.getById(id).subscribe({
        next: (res) => {
          this.student = res.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(["/students"]);
        },
      });
    }
  }

  getFullName(): string {
    if (!this.student) return "";
    return [
      this.student.firstName,
      this.student.middleName,
      this.student.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  getInitials(): string {
    if (!this.student) return "ST";
    const first = this.student.firstName?.charAt(0) || "";
    const last = this.student.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "ST";
  }

  calculateAge(dob?: string): string {
    if (!dob) return "-";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "-";
    const diff = Date.now() - birth.getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return `${age} years`;
  }

  goBack(): void {
    this.router.navigate(["/students"]);
  }

  editStudent(): void {
    if (this.student) {
      this.router.navigate(["/students", this.student._id, "edit"]);
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40";
      case "GRADUATED":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/40";
      case "SUSPENDED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40";
      case "TRANSFERRED":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/40";
      case "EXPELLED":
        return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800/40";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  }
}
