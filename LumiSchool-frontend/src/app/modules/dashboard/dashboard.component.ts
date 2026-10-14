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
