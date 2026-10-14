import { Component, OnInit } from "@angular/core";
import { ReportsService } from "../../shared/services/reports/reports.service";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { DashboardStats } from "../../shared/interfaces/models";
import { AuthService } from "../../shared/services/auth/auth.service";

export const DEFAULT_DASHBOARD_STATS: DashboardStats = {
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
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = DEFAULT_DASHBOARD_STATS;
  loading = true;

  constructor(
    private reportsService: ReportsService,
    public themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.reportsService.getDashboard().subscribe({
      next: (res) => {
        this.stats = this.normalizeStats(res?.data);
        this.loading = false;
      },
      error: () => {
        this.stats = DEFAULT_DASHBOARD_STATS;
        this.loading = false;
      },
    });
  }

  private normalizeStats(raw: any): DashboardStats {
    if (!raw) return DEFAULT_DASHBOARD_STATS;
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

  get activeTenant() {
    const id = this.authService.getActiveTenantId();
    return this.authService.getTenants().find((t) => t._id === id) || null;
  }

  get tenantCount(): number {
    return this.authService.getTenants().length;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  getUserName(): string {
    const user = this.authService.getUser();
    return user?.firstName || user?.name || "Administrator";
  }

  getCurrentDateFormatted(): string {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }

  getMalePercentage(): number {
    if (!this.stats?.students?.total) return 50;
    const male = this.stats.students.byGender?.male || 0;
    return Math.round((male / this.stats.students.total) * 100);
  }

  getFemalePercentage(): number {
    if (!this.stats?.students?.total) return 50;
    const female = this.stats.students.byGender?.female || 0;
    return Math.round((female / this.stats.students.total) * 100);
  }

  getStudentTeacherRatio(): string {
    if (!this.stats?.students?.total || !this.stats?.staff?.teachers) return "1:25";
    const ratio = Math.round(this.stats.students.total / this.stats.staff.teachers);
    return `1:${ratio}`;
  }

  getStreamsPerClass(): string {
    if (!this.stats?.classes?.total || !this.stats?.classes?.streams) return "1.0";
    return (this.stats.classes.streams / this.stats.classes.total).toFixed(1);
  }
}
