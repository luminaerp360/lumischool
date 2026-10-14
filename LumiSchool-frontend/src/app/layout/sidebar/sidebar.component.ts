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

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  superAdminOnly?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
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

  allSections: NavSection[] = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", icon: "fas fa-th-large", route: "/dashboard" },
      ],
    },
    {
      title: "Academic & CBC",
      items: [
        { label: "Students", icon: "fas fa-user-graduate", route: "/students" },
        { label: "Guardians", icon: "fas fa-users", route: "/guardians" },
        { label: "Classes", icon: "fas fa-chalkboard", route: "/classes" },
        { label: "Academics", icon: "fas fa-book-open", route: "/academics" },
        { label: "Exams & CBC", icon: "fas fa-file-alt", route: "/exams" },
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
      ],
    },
    {
      title: "Finance & Ops",
      items: [
        {
          label: "Finance & Fees",
          icon: "fas fa-money-bill-wave",
          route: "/finance",
        },
        {
          label: "Communication",
          icon: "fas fa-bullhorn",
          route: "/communication",
        },
        {
          label: "Reports",
          icon: "fas fa-chart-line",
          route: "/reports",
        },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Users & Staff", icon: "fas fa-users-cog", route: "/users" },
        { label: "Settings", icon: "fas fa-sliders-h", route: "/settings" },
        {
          label: "Schools",
          icon: "fas fa-school",
          route: "/system-tenants",
          superAdminOnly: true,
        },
      ],
    },
  ];

  sections: NavSection[] = [];
  private userSub?: Subscription;

  constructor(
    public router: Router,
    public themeService: ThemeService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((user) => {
      const isSuperAdmin = user?.role === "SUPER_ADMIN";
      this.sections = this.allSections
        .map((sec) => ({
          ...sec,
          items: sec.items.filter((item) => !item.superAdminOnly || isSuperAdmin),
        }))
        .filter((sec) => sec.items.length > 0);
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  getTenantShortName(): string {
    const tenants = this.authService.getTenants();
    const activeId = this.authService.getActiveTenantId();
    const active = tenants.find((t) => t._id === activeId);
    return active?.name || "School Portal";
  }
}
