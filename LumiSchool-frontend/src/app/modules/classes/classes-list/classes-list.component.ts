import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { SchoolClass, PopulatedUser } from "../../../shared/interfaces/models";

@Component({
  selector: "app-classes-list",
  templateUrl: "./classes-list.component.html",
  styleUrls: ["./classes-list.component.scss"],
})
export class ClassesListComponent implements OnInit {
  classes: SchoolClass[] = [];
  loading = true;
  search = "";

  constructor(
    private classesService: ClassesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.classesService.getAll({ search: this.search }).subscribe({
      next: (res) => {
        this.classes = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  view(id: string): void {
    this.router.navigate(["/classes", id]);
  }

  addClass(): void {
    this.router.navigate(["/classes/new"]);
  }

  teacherName(val?: string | PopulatedUser): string {
    if (!val) return "—";
    if (typeof val === "object") return `${val.firstName} ${val.lastName}`;
    return val;
  }
}
