import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UsersService } from "../../../shared/services/users/users.service";
import { StaffUser, Role } from "../../../shared/interfaces/models";
import { STAFF_ROLE_META } from "../teacher-form/teacher-form.component";

interface RoleTab {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: "app-teachers-list",
  templateUrl: "./teachers-list.component.html",
  styleUrls: ["./teachers-list.component.scss"],
})
export class TeachersListComponent implements OnInit {
  staff: StaffUser[] = [];
  loading = false;
  search = "";
  filterRole = "TEACHER";

  readonly roleTabs: RoleTab[] = [
    { value: "TEACHER", label: "Teachers", icon: "fa-chalkboard-teacher" },
    { value: "PRINCIPAL", label: "Administration", icon: "fa-user-tie" },
    { value: "BURSAR", label: "Bursar", icon: "fa-money-bill-wave" },
    { value: "SCHOOL_ADMIN", label: "Admin / BOM", icon: "fa-briefcase" },
  ];

  readonly roleMeta = STAFF_ROLE_META;

  constructor(
    private usersService: UsersService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const params: Record<string, any> = {};
    if (this.filterRole) params["role"] = this.filterRole;
    if (this.search) params["search"] = this.search;

    this.usersService.getAll(params).subscribe({
      next: (res) => {
        const raw = (res.data as any).data ?? res.data ?? [];
        this.staff = Array.isArray(raw) ? raw : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  selectTab(role: string): void {
    this.filterRole = role;
    this.search = "";
    this.load();
  }

  addStaff(): void {
    this.router.navigate(["/teachers/new"]);
  }

  view(id: string): void {
    this.router.navigate(["/teachers", id]);
  }

  edit(id: string, $event: Event): void {
    $event.stopPropagation();
    this.router.navigate(["/teachers", id, "edit"]);
  }

  fullName(u: StaffUser): string {
    return `${u.firstName} ${u.lastName}`;
  }

  initials(u: StaffUser): string {
    return ((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase();
  }

  roleClass(role: string): string {
    return this.roleMeta[role]?.color ?? "bg-gray-100 text-gray-600";
  }

  roleLabel(role: string): string {
    return this.roleMeta[role]?.label ?? role;
  }
}
