import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UsersService } from "../../../shared/services/users/users.service";
import { StaffUser } from "../../../shared/interfaces/models";

export const STAFF_ROLE_META: Record<
  string,
  { label: string; hint: string; icon: string; color: string }
> = {
  TEACHER: {
    label: "Teacher",
    hint: "Certified educator assigned to classes and subjects. Can be a class teacher or subject teacher.",
    icon: "fa-chalkboard-teacher",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  PRINCIPAL: {
    label: "Principal / Deputy",
    hint: "School head or deputy. Oversees academic and administrative operations of the school.",
    icon: "fa-user-tie",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  BURSAR: {
    label: "Bursar",
    hint: "Financial officer responsible for fee collection, banking, and financial records.",
    icon: "fa-money-bill-wave",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  SCHOOL_ADMIN: {
    label: "Admin / BOM",
    hint: "Administrative staff or Board of Management member. BOM includes parent reps, community reps, and government reps.",
    icon: "fa-briefcase",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
};

@Component({
  selector: "app-teacher-form",
  templateUrl: "./teacher-form.component.html",
  styleUrls: ["./teacher-form.component.scss"],
})
export class TeacherFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  loadingData = false;
  error = "";

  readonly staffRoles = Object.keys(STAFF_ROLE_META);
  readonly roleMeta = STAFF_ROLE_META;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      role: ["TEACHER", Validators.required],
      password: [""],
      isActive: [true],
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEdit = true;
      this.loadingData = true;
      this.usersService.getById(id).subscribe({
        next: (res) => {
          const u = res.data as unknown as StaffUser;
          this.form.patchValue({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: u.phone ?? "",
            role: u.role,
            isActive: u.isActive,
          });
          // password optional on edit — remove required
          this.form.get("password")?.clearValidators();
          this.form.get("password")?.updateValueAndValidity();
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
        },
      });
    } else {
      // password required on create
      this.form
        .get("password")
        ?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get("password")?.updateValueAndValidity();
    }
  }

  get selectedRoleMeta() {
    return this.roleMeta[this.form.value.role] ?? null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";
    const val = this.form.value;
    const payload: Record<string, any> = {
      firstName: val.firstName.trim(),
      lastName: val.lastName.trim(),
      email: val.email.trim(),
      role: val.role,
    };
    if (val.phone?.trim()) payload["phone"] = val.phone.trim();
    if (val.password?.trim()) payload["password"] = val.password.trim();
    // isActive only valid on update
    if (this.isEdit) payload["isActive"] = val.isActive;

    const id = this.route.snapshot.paramMap.get("id");
    const req$ = this.isEdit
      ? this.usersService.update(id!, payload as any)
      : this.usersService.create(payload as any);

    req$.subscribe({
      next: (res) => {
        const saved = res.data as unknown as StaffUser;
        this.router.navigate(["/teachers", saved._id]);
      },
      error: (err) => {
        this.error = err?.error?.message ?? "Failed to save. Please try again.";
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(["/teachers"]);
  }
}
