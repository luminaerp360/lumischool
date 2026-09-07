import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { UsersService } from "../../../shared/services/users/users.service";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { AcademicsService } from "../../../shared/services/academics/academics.service";
import {
  StaffUser,
  SchoolClass,
  SubjectAssignment,
  Subject,
} from "../../../shared/interfaces/models";
import { STAFF_ROLE_META } from "../teacher-form/teacher-form.component";

@Component({
  selector: "app-teacher-detail",
  templateUrl: "./teacher-detail.component.html",
  styleUrls: ["./teacher-detail.component.scss"],
})
export class TeacherDetailComponent implements OnInit {
  staff: StaffUser | null = null;
  loading = true;
  classesAsTeacher: SchoolClass[] = [];
  assignments: SubjectAssignment[] = [];

  readonly roleMeta = STAFF_ROLE_META;

  constructor(
    private usersService: UsersService,
    private classesService: ClassesService,
    private academicsService: AcademicsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.loading = true;

    // Load user first, then load parallel data
    this.usersService.getById(id).subscribe({
      next: (res) => {
        this.staff = res.data as unknown as StaffUser;

        forkJoin([
          this.classesService.getAll({ classTeacherId: id }),
          this.academicsService.getAssignments({ teacherId: id }),
        ]).subscribe({
          next: ([classRes, assignRes]) => {
            const classData =
              (classRes.data as any).data ?? classRes.data ?? [];
            this.classesAsTeacher = Array.isArray(classData) ? classData : [];

            const assignData =
              (assignRes.data as any).data ?? assignRes.data ?? [];
            this.assignments = Array.isArray(assignData) ? assignData : [];

            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get fullName(): string {
    if (!this.staff) return "";
    return `${this.staff.firstName} ${this.staff.lastName}`;
  }

  get initials(): string {
    if (!this.staff) return "?";
    return (
      (this.staff.firstName?.[0] ?? "") + (this.staff.lastName?.[0] ?? "")
    ).toUpperCase();
  }

  get currentRoleMeta() {
    return this.staff ? (this.roleMeta[this.staff.role] ?? null) : null;
  }

  subjectName(val: any): string {
    if (val && typeof val === "object") {
      return val.name + (val.code ? ` (${val.code})` : "");
    }
    return val ?? "—";
  }

  className(val: any): string {
    if (val && typeof val === "object") return val.name ?? val._id;
    return val ?? "—";
  }

  editStaff(): void {
    if (this.staff) this.router.navigate(["/teachers", this.staff._id, "edit"]);
  }

  goBack(): void {
    this.router.navigate(["/teachers"]);
  }
}
