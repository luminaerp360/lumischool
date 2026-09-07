import { Component, OnInit } from "@angular/core";
import { ReportsService } from "../../shared/services/reports/reports.service";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { DashboardStats } from "../../shared/interfaces/models";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private reportsService: ReportsService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
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
}
