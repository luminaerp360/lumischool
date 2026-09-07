import { Component, OnInit } from "@angular/core";
import { ReportsService } from "../../shared/services/reports/reports.service";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { DashboardStats } from "../../shared/interfaces/models";
import { AuthService } from "../../shared/services/auth/auth.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private reportsService: ReportsService,
    public themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.reportsService.getDashboard().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get activeTenant() {
    const id = this.authService.getActiveTenantId();
    return this.authService.getTenants().find((t) => t._id === id) || null;
  }

  get tenantCount(): number {
    return this.authService.getTenants().length;
  }
}
