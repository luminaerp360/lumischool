import { Component, OnInit } from "@angular/core";
import { TenantsService } from "../../shared/services/tenants/tenants.service";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { AuthService } from "../../shared/services/auth/auth.service";
import { Tenant } from "../../shared/interfaces/models";

@Component({
  selector: "app-system-tenants",
  templateUrl: "./system-tenants.component.html",
  styleUrls: ["./system-tenants.component.scss"],
})
export class SystemTenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = true;
  showForm = false;
  editing: Tenant | null = null;
  saving = false;
  form: Partial<Tenant> = {};

  plans = ["free", "basic", "pro", "enterprise"];

  constructor(
    private tenantsService: TenantsService,
    private authService: AuthService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantsService.getAll().subscribe({
      next: (res) => {
        this.tenants = res.data;
        this.authService.setTenantContext(
          this.tenants,
          this.authService.getActiveTenantId(),
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openForm(tenant?: Tenant): void {
    this.editing = tenant || null;
    this.form = tenant
      ? { ...tenant }
      : {
          name: "",
          slug: "",
          contactEmail: "",
          plan: "free" as any,
          isActive: true,
          maxUsers: 10,
          maxStudents: 500,
        };
    this.showForm = true;
  }

  save(): void {
    if (!this.form.name) return;
    this.saving = true;
    const obs = this.editing
      ? this.tenantsService.update(this.editing._id, this.form)
      : this.tenantsService.create(this.form);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.loadTenants();
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  deleteTenant(id: string): void {
    if (!confirm("Delete this organization?")) return;
    this.tenantsService.delete(id).subscribe(() => this.loadTenants());
  }

  getPlanClasses(plan: string): string {
    const map: Record<string, string> = {
      free: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400",
      basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      enterprise:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return map[plan] || "";
  }
}
