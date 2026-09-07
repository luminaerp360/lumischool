import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { GuardiansService } from "../../../shared/services/guardians/guardians.service";
import { Guardian } from "../../../shared/interfaces/models";

@Component({
  selector: "app-guardians-list",
  templateUrl: "./guardians-list.component.html",
  styleUrls: ["./guardians-list.component.scss"],
})
export class GuardiansListComponent implements OnInit {
  guardians: Guardian[] = [];
  loading = true;
  search = "";

  constructor(
    private guardiansService: GuardiansService,
    private router: Router,
  ) {}

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
