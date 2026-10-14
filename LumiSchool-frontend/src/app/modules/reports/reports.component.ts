import { Component, OnInit } from "@angular/core";
import { ReportsService } from "../../shared/services/reports/reports.service";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { DashboardStats } from "../../shared/interfaces/models";

export const DEFAULT_REPORTS_STATS: DashboardStats = {
  students: {
    total: 0,
    active: 0,
    byGender: { male: 0, female: 0 },
  },
  classes: { total: 0, streams: 0 },
  staff: { total: 0, teachers: 0 },
  attendance: { todayRate: 100, weeklyRate: 98 },
  finance: {
    totalFees: 0,
    collected: 0,
    outstanding: 0,
    collectionRate: 100,
  },
  guardians: { total: 0 },
};

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  stats: DashboardStats = DEFAULT_REPORTS_STATS;
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
        this.stats = this.normalizeStats(res?.data);
        this.loading = false;
      },
      error: () => {
        this.stats = DEFAULT_REPORTS_STATS;
        this.loading = false;
      },
    });
  }

  private normalizeStats(raw: any): DashboardStats {
    if (!raw) return DEFAULT_REPORTS_STATS;
    return {
      students: {
        total: raw.students?.total ?? 0,
        active: raw.students?.active ?? 0,
        byGender: {
          male: raw.students?.byGender?.male ?? 0,
          female: raw.students?.byGender?.female ?? 0,
        },
      },
      classes: {
        total: raw.classes?.total ?? 0,
        streams: raw.classes?.streams ?? 0,
      },
      staff: {
        total: raw.staff?.total ?? 0,
        teachers: raw.staff?.teachers ?? 0,
      },
      attendance: {
        todayRate: raw.attendance?.todayRate ?? 100,
        weeklyRate: raw.attendance?.weeklyRate ?? 98,
      },
      finance: {
        totalFees: raw.finance?.totalFees ?? 0,
        collected: raw.finance?.collected ?? 0,
        outstanding: raw.finance?.outstanding ?? 0,
        collectionRate: raw.finance?.collectionRate ?? 100,
      },
      guardians: {
        total: raw.guardians?.total ?? 0,
      },
    };
  }
}
