import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ThemeService } from "../../shared/services/theme/theme.service";
import { AuthService } from "../../shared/services/auth/auth.service";

interface NavItem {
  label: string;
  icon: string;
  route: string;
  superAdminOnly?: boolean;
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() mobileHidden = true;
  @Input() isMobile = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  allNavItems: NavItem[] = [
    { label: "Dashboard", icon: "fas fa-th-large", route: "/dashboard" },
    { label: "Students", icon: "fas fa-user-graduate", route: "/students" },
    { label: "Guardians", icon: "fas fa-users", route: "/guardians" },
    { label: "Classes", icon: "fas fa-chalkboard", route: "/classes" },
    { label: "Academics", icon: "fas fa-book", route: "/academics" },
    { label: "Exams", icon: "fas fa-file-alt", route: "/exams" },
    {
      label: "Teachers",
      icon: "fas fa-chalkboard-teacher",
      route: "/teachers",
    },
    {
      label: "Attendance",
      icon: "fas fa-clipboard-check",
      route: "/attendance",
    },
    {
      label: "Finance",
      icon: "fas fa-money-bill-wave",
      route: "/finance",
    },
    {
      label: "Communication",
      icon: "fas fa-bullhorn",
      route: "/communication",
    },
    { label: "Reports", icon: "fas fa-chart-bar", route: "/reports" },
    { label: "Users", icon: "fas fa-users-cog", route: "/users" },
    { label: "Settings", icon: "fas fa-cog", route: "/settings" },
    {
      label: "Schools",
      icon: "fas fa-school",
      route: "/system-tenants",
      superAdminOnly: true,
    },
  ];

  navItems: NavItem[] = [];
  private userSub?: Subscription;

  constructor(
    public router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((user) => {
      const isSuperAdmin = user?.role === "SUPER_ADMIN";
      this.navItems = this.allNavItems.filter(
        (item) => !item.superAdminOnly || isSuperAdmin,
      );
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
