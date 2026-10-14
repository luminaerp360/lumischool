import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StudentsService } from "../../../shared/services/students/students.service";
import { Student } from "../../../shared/interfaces/models";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-students-list",
  templateUrl: "./students-list.component.html",
  styleUrls: ["./students-list.component.scss"],
})
export class StudentsListComponent implements OnInit {
  students: Student[] = [];
  loading = true;
  search = "";
  statusFilter = "";
  levelFilter = "";
  page = 1;
  limit = 20;
  total = 0;

  constructor(
    private studentsService: StudentsService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentsService
      .getAll({
        page: this.page,
        limit: this.limit,
        search: this.search,
        status: this.statusFilter,
        level: this.levelFilter,
      })
      .subscribe({
        next: (res) => {
          this.students = res.data;
          this.total = res.meta?.total || 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.page = 1;
    this.loadStudents();
  }

  clearFilters(): void {
    this.search = "";
    this.statusFilter = "";
    this.levelFilter = "";
    this.page = 1;
    this.loadStudents();
  }

  viewStudent(id: string): void {
    this.router.navigate(["/students", id]);
  }

  editStudent(id: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(["/students", id, "edit"]);
  }

  addStudent(): void {
    this.router.navigate(["/students/new"]);
  }

  getFullName(s: Student): string {
    return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
  }

  getInitials(s: Student): string {
    const first = s.firstName?.charAt(0) || "";
    const last = s.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "ST";
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
      GRADUATED: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40",
      SUSPENDED: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
      TRANSFERRED: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40",
      EXPELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-800/40",
      DROPPED_OUT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    };
    return map[status] || "bg-slate-100 text-slate-700";
  }

  getLevelBadge(level: string): { label: string; class: string } {
    switch (level) {
      case "PRE_PRIMARY":
        return { label: "Pre-Primary", class: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/40" };
      case "PRIMARY":
        return { label: "Primary", class: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/40" };
      case "JSS":
        return { label: "Junior Secondary (JSS)", class: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40" };
      case "SENIOR":
        return { label: "Senior Secondary", class: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/40" };
      default:
        return { label: level || "Standard", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadStudents();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadStudents();
    }
  }

  getActiveCount(): number {
    return this.students.filter((s) => s.status === "ACTIVE").length;
  }

  getBoarderCount(): number {
    return this.students.filter((s) => s.boardingStatus === "BOARDER").length;
  }
}
