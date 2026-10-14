import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { SchoolClass, PopulatedUser } from "../../../shared/interfaces/models";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-classes-list",
  templateUrl: "./classes-list.component.html",
  styleUrls: ["./classes-list.component.scss"],
})
export class ClassesListComponent implements OnInit {
  classes: SchoolClass[] = [];
  loading = true;
  search = "";
  selectedLevel = "";

  constructor(
    private classesService: ClassesService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  get totalClasses(): number {
    return this.classes.length;
  }

  get totalStreams(): number {
    return this.classes.reduce((sum, c) => sum + (c.streamIds?.length || 0), 0);
  }

  get totalCapacity(): number {
    return this.classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  }

  get filteredClasses(): SchoolClass[] {
    return this.classes.filter((c) => {
      const matchLevel = !this.selectedLevel || c.level === this.selectedLevel;
      const term = this.search.toLowerCase().trim();
      if (!term) return matchLevel;
      const name = (c.name || "").toLowerCase();
      const level = (c.level || "").toLowerCase();
      const teacher = this.teacherName(c.classTeacherId).toLowerCase();
      return matchLevel && (name.includes(term) || level.includes(term) || teacher.includes(term));
    });
  }

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
