import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StudentsService } from "../../../shared/services/students/students.service";
import { Student } from "../../../shared/interfaces/models";

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

  goBack(): void {
    this.router.navigate(["/students"]);
  }

  editStudent(): void {
    if (this.student) {
      this.router.navigate(["/students", this.student._id, "edit"]);
    }
  }
}
