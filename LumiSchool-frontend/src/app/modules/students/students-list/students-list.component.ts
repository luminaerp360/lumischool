import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StudentsService } from "../../../shared/services/students/students.service";
import { Student } from "../../../shared/interfaces/models";

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

  viewStudent(id: string): void {
    this.router.navigate(["/students", id]);
  }

  addStudent(): void {
    this.router.navigate(["/students/new"]);
  }

  getFullName(s: Student): string {
    return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: "badge-active",
      GRADUATED: "badge-completed",
      SUSPENDED: "badge-pending",
      TRANSFERRED: "badge-draft",
      EXPELLED: "badge-failed",
      DROPPED_OUT: "badge-expired",
    };
    return map[status] || "badge-draft";
  }
}
