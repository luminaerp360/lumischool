import { Component, OnInit } from "@angular/core";
import {
  UsersService,
  SaveUserPayload,
} from "../../../shared/services/users/users.service";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { ThemeService } from "../../../shared/services/theme/theme.service";
import { LumiSchoolUser, Tenant } from "../../../shared/interfaces/models";

type UserRole = LumiSchoolUser["role"];

interface UserFormModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  isActive: boolean;
  tenantIds: string[];
}

@Component({
  selector: "app-users-list",
  templateUrl: "./users-list.component.html",
  styleUrls: ["./users-list.component.scss"],
})
export class UsersListComponent implements OnInit {
  users: LumiSchoolUser[] = [];
  loading = true;
  search = "";
  showUserForm = false;
  savingUser = false;
  editingUser: LumiSchoolUser | null = null;
  organizations: Tenant[] = [];
  roles: UserRole[] = [
    "SUPER_ADMIN",
    "SCHOOL_ADMIN",
    "PRINCIPAL",
    "BURSAR",
    "TEACHER",
    "PARENT",
    "STUDENT",
  ];

  userForm: UserFormModel = this.createEmptyForm();

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.organizations = this.authService.getTenants();
    this.loadUsers();
    this.authService.tenantList$.subscribe((tenants) => {
      this.organizations = tenants;
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getAll({ search: this.search }).subscribe({
      next: (res) => {
        this.users = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  openCreate(): void {
    this.editingUser = null;
    this.userForm = this.createEmptyForm();
    this.showUserForm = true;
  }

  openEdit(user: LumiSchoolUser): void {
    this.editingUser = user;
    this.userForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      password: "",
      isActive: user.isActive,
      tenantIds: [...(user.tenantIds || [])],
    };
    this.showUserForm = true;
  }

  userName(user: LumiSchoolUser): string {
    return (
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.name ||
      "?"
    );
  }

  saveUser(): void {
    if (
      !this.userForm.firstName ||
      !this.userForm.lastName ||
      !this.userForm.email
    )
      return;
    if (!this.editingUser && !this.userForm.password) return;

    const payload: SaveUserPayload = {
      firstName: this.userForm.firstName.trim(),
      lastName: this.userForm.lastName.trim(),
      email: this.userForm.email.trim(),
      phone: this.userForm.phone.trim() || undefined,
      role: this.userForm.role,
      isActive: this.userForm.isActive,
    };
    if (this.userForm.password.trim())
      payload.password = this.userForm.password.trim();

    this.savingUser = true;
    const request = this.editingUser
      ? this.usersService.update(this.editingUser._id, payload)
      : this.usersService.create(payload);

    request.subscribe({
      next: () => {
        this.savingUser = false;
        this.showUserForm = false;
        this.loadUsers();
      },
      error: () => {
        this.savingUser = false;
      },
    });
  }

  deleteUser(userId: string): void {
    if (!confirm("Delete this user?")) return;
    this.usersService.delete(userId).subscribe(() => this.loadUsers());
  }

  trackByUser(index: number, user: LumiSchoolUser): string {
    return user._id;
  }

  getRoleClasses(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      SCHOOL_ADMIN:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      PRINCIPAL:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      BURSAR:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      TEACHER:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      PARENT:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      STUDENT:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
    return map[role] || "";
  }

  private createEmptyForm(): UserFormModel {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "TEACHER",
      password: "",
      isActive: true,
      tenantIds: this.getDefaultTenantIds(),
    };
  }

  private getDefaultTenantIds(): string[] {
    const activeTenantId = this.authService.getActiveTenantId();
    if (activeTenantId) return [activeTenantId];
    if (this.organizations.length === 1) return [this.organizations[0]._id];
    return [];
  }
}
