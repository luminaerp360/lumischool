import {
  Component,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth/auth.service";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { Tenant } from "../../shared/interfaces/models";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  showUserMenu = false;
  showColorPicker = false;
  showTenantMenu = false;
  switchingTenant = false;
  tenantSwitchError = "";

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private elementRef: ElementRef,
  ) {}

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".user-menu-wrapper")) {
      this.showUserMenu = false;
    }
    if (!target.closest(".tenant-menu-wrapper")) {
      this.showTenantMenu = false;
    }
    if (!target.closest(".color-picker-wrapper")) {
      this.showColorPicker = false;
    }
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    this.showTenantMenu = false;
    this.showColorPicker = false;
  }

  toggleTenantMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showTenantMenu = !this.showTenantMenu;
    this.showUserMenu = false;
    this.showColorPicker = false;
  }

  toggleColorPicker(event: MouseEvent): void {
    event.stopPropagation();
    this.showColorPicker = !this.showColorPicker;
    this.showUserMenu = false;
    this.showTenantMenu = false;
  }

  getPageTitle(): string {
    const url = this.router.url.split("?")[0];
    if (url.startsWith("/dashboard")) return "Dashboard";
    if (url.startsWith("/students")) return "Students";
    if (url.startsWith("/guardians")) return "Guardians";
    if (url.startsWith("/classes")) return "Classes";
    if (url.startsWith("/academics")) return "Academics";
    if (url.startsWith("/exams")) return "Exams";
    if (url.startsWith("/teachers")) return "Teachers";
    if (url.startsWith("/attendance")) return "Attendance";
    if (url.startsWith("/finance")) return "Finance";
    if (url.startsWith("/communication")) return "Communication";
    if (url.startsWith("/reports")) return "Reports";
    if (url.startsWith("/users")) return "Users";
    if (url.startsWith("/settings")) return "Settings";
    if (url.startsWith("/system-tenants")) return "Schools";
    return "School Management";
  }

  getUserDisplayName(): string {
    const user = this.authService.getUser();
    if (!user) return "User";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    return user.email?.split("@")[0] || "User";
  }

  getUserRoleName(): string {
    const user = this.authService.getUser();
    switch (user?.role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "SCHOOL_ADMIN":
        return "School Admin";
      case "PRINCIPAL":
        return "Principal";
      case "BURSAR":
        return "Bursar";
      case "TEACHER":
        return "Teacher";
      case "PARENT":
        return "Parent";
      case "STUDENT":
        return "Student";
      default:
        return (user as any)?.role ? String((user as any).role).replace(/_/g, " ") : "Staff";
    }
  }

  getUserInitials(): string {
    const user = this.authService.getUser();
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    const name = user.firstName || user.name || user.email || "U";
    return name.charAt(0).toUpperCase();
  }

  onAccentChange(hex: string): void {
    this.themeService.setAccentColor(hex);
  }

  switchTenant(tenant: Tenant): void {
    const tenantId = (tenant as any)?._id || (tenant as any)?.id || "";
    if (!tenantId) {
      this.tenantSwitchError =
        "This organization cannot be switched right now. Please refresh and try again.";
      return;
    }

    if (tenantId === this.authService.getActiveTenantId()) {
      this.showTenantMenu = false;
      return;
    }

    this.tenantSwitchError = "";
    this.switchingTenant = true;
    this.authService.setTenantContext(this.authService.getTenants(), tenantId);
    this.switchingTenant = false;
    this.showTenantMenu = false;
    window.location.reload();
  }

  getActiveTenantName(): string {
    const tenants = this.authService.getTenants();
    const activeId = this.authService.getActiveTenantId();
    const active = tenants.find((t) => t._id === activeId);
    return active?.name || "School Portal";
  }

  canSwitchTenants(tenants: Tenant[] | null): boolean {
    return (tenants?.length || 0) > 1;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
