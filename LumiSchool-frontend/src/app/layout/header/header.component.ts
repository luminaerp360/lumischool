import { Component, Output, EventEmitter } from "@angular/core";
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
  ) {}

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
    return active?.name || "No Organization";
  }

  canSwitchTenants(tenants: Tenant[] | null): boolean {
    return (tenants?.length || 0) > 1;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
