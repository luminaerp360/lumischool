import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { GuardiansService } from "../../../shared/services/guardians/guardians.service";
import { Guardian } from "../../../shared/interfaces/models";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-guardians-list",
  templateUrl: "./guardians-list.component.html",
  styleUrls: ["./guardians-list.component.scss"],
})
export class GuardiansListComponent implements OnInit {
  guardians: Guardian[] = [];
  loading = true;
  search = "";
  selectedRelationship = "";

  constructor(
    private guardiansService: GuardiansService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  get totalGuardians(): number {
    return this.guardians.length;
  }

  get primaryCount(): number {
    return this.guardians.filter((g) => g.isPrimaryGuardian).length;
  }

  get totalLinkedStudents(): number {
    return this.guardians.reduce((acc, g) => acc + (g.studentIds?.length || 0), 0);
  }

  get filteredGuardians(): Guardian[] {
    return this.guardians.filter((g) => {
      const matchRel = !this.selectedRelationship || g.relationship === this.selectedRelationship;
      const term = this.search.toLowerCase().trim();
      if (!term) return matchRel;
      const fullName = this.getFullName(g).toLowerCase();
      const phone = (g.phone || "").toLowerCase();
      const email = (g.email || "").toLowerCase();
      return matchRel && (fullName.includes(term) || phone.includes(term) || email.includes(term));
    });
  }

  getInitials(g: Guardian): string {
    const f = g.firstName ? g.firstName[0] : "";
    const l = g.lastName ? g.lastName[0] : "";
    return (f + l).toUpperCase() || "GD";
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.guardiansService.getAll({ search: this.search }).subscribe({
      next: (res) => {
        this.guardians = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getFullName(g: Guardian): string {
    return [g.firstName, g.middleName, g.lastName].filter(Boolean).join(" ");
  }

  view(id: string): void {
    this.router.navigate(["/guardians", id]);
  }

  addGuardian(): void {
    this.router.navigate(["/guardians/new"]);
  }
}
