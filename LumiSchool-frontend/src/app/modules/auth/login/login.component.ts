import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { ThemeService } from "../../../shared/services/theme/theme.service";
import { TenantsService } from "../../../shared/services/tenants/tenants.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  email = "";
  password = "";
  loading = false;
  error = "";

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private tenantsService: TenantsService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/dashboard"]);
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.error = "Please enter email and password";
      return;
    }
    this.loading = true;
    this.error = "";
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        const user = res.data.user;
        if (user.role === "SUPER_ADMIN") {
          // Fetch all tenants so SUPER_ADMIN can operate on any school
          this.tenantsService.getAll().subscribe({
            next: (tenantsRes) => {
              this.authService.setTenantContext(tenantsRes.data || []);
              this.loading = false;
              this.router.navigate(["/dashboard"]);
            },
            error: () => {
              this.loading = false;
              this.router.navigate(["/dashboard"]);
            },
          });
        } else {
          this.loading = false;
          this.router.navigate(["/dashboard"]);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || "Invalid credentials";
      },
    });
  }
}
