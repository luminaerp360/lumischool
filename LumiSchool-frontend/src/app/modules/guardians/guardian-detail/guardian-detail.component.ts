import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GuardiansService } from "../../../shared/services/guardians/guardians.service";
import { Guardian, PopulatedStudent } from "../../../shared/interfaces/models";

@Component({
  selector: "app-guardian-detail",
  templateUrl: "./guardian-detail.component.html",
  styleUrls: ["./guardian-detail.component.scss"],
})
export class GuardianDetailComponent implements OnInit {
  guardian: Guardian | null = null;
  loading = true;

  constructor(
    private guardiansService: GuardiansService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.guardiansService.getById(id).subscribe({
        next: (res) => {
          this.guardian = res.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  getFullName(g: Guardian): string {
    return [g.firstName, g.middleName, g.lastName].filter(Boolean).join(" ");
  }

  goBack(): void {
    this.router.navigate(["/guardians"]);
  }

  editGuardian(): void {
    if (this.guardian) {
      this.router.navigate(["/guardians", this.guardian._id, "edit"]);
    }
  }

  studentName(val: string | PopulatedStudent): string {
    if (typeof val === "object") {
      return [val.firstName, val.middleName, val.lastName]
        .filter(Boolean)
        .join(" ");
    }
    return val;
  }

  get linkedStudents(): (string | PopulatedStudent)[] {
    return (this.guardian?.studentIds as (string | PopulatedStudent)[]) || [];
  }
}
