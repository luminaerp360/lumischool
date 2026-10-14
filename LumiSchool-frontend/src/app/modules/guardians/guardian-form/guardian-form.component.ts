import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { GuardiansService } from "../../../shared/services/guardians/guardians.service";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-guardian-form",
  templateUrl: "./guardian-form.component.html",
  styleUrls: ["./guardian-form.component.scss"],
})
export class GuardianFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  guardianId: string | null = null;
  loading = false;
  loadingGuardian = false;
  error = "";

  readonly relationships = [
    "FATHER",
    "MOTHER",
    "GRANDFATHER",
    "GRANDMOTHER",
    "UNCLE",
    "AUNT",
    "BROTHER",
    "SISTER",
    "GUARDIAN",
    "SPONSOR",
    "OTHER",
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private guardiansService: GuardiansService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.guardianId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.guardianId;
    if (this.isEditMode && this.guardianId) {
      this.loadGuardian(this.guardianId);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      firstName: ["", Validators.required],
      middleName: [""],
      lastName: ["", Validators.required],
      phone: ["", Validators.required],
      alternatePhone: [""],
      email: ["", Validators.email],
      idNumber: [""],
      relationship: ["GUARDIAN"],
      occupation: [""],
      address: [""],
      county: [""],
      isPrimaryGuardian: [false],
    });
  }

  loadGuardian(id: string): void {
    this.loadingGuardian = true;
    this.guardiansService.getById(id).subscribe({
      next: (res) => {
        const g = res.data;
        this.form.patchValue({
          firstName: g.firstName,
          middleName: g.middleName || "",
          lastName: g.lastName,
          phone: g.phone,
          alternatePhone: g.alternatePhone || "",
          email: g.email || "",
          idNumber: g.idNumber || "",
          relationship: g.relationship || "GUARDIAN",
          occupation: g.occupation || "",
          address: g.address || "",
          county: g.county || "",
          isPrimaryGuardian: g.isPrimaryGuardian || false,
        });
        this.loadingGuardian = false;
      },
      error: () => {
        this.loadingGuardian = false;
        this.router.navigate(["/guardians"]);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";

    const raw = this.form.value;
    const payload: any = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      phone: raw.phone,
    };
    if (raw.middleName) payload.middleName = raw.middleName;
    if (raw.alternatePhone) payload.alternatePhone = raw.alternatePhone;
    if (raw.email) payload.email = raw.email;
    if (raw.idNumber) payload.idNumber = raw.idNumber;
    if (raw.relationship) payload.relationship = raw.relationship;
    if (raw.occupation) payload.occupation = raw.occupation;
    if (raw.address) payload.address = raw.address;
    if (raw.county) payload.county = raw.county;
    payload.isPrimaryGuardian = !!raw.isPrimaryGuardian;

    const action$ = this.isEditMode
      ? this.guardiansService.update(this.guardianId!, payload)
      : this.guardiansService.create(payload);

    action$.subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(["/guardians", res.data._id]);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message || "An error occurred. Please try again.";
      },
    });
  }

  cancel(): void {
    if (this.isEditMode && this.guardianId) {
      this.router.navigate(["/guardians", this.guardianId]);
    } else {
      this.router.navigate(["/guardians"]);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
