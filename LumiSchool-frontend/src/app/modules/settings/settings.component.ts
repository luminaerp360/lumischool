import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemeService } from '../../shared/services/theme/theme.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { TenantsService } from '../../shared/services/tenants/tenants.service';
import { HotToastService } from '@ngneat/hot-toast';
import { Tenant } from '../../shared/interfaces/models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  presetColors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];

  admForm!: FormGroup;
  saving = false;
  tenant: Tenant | null = null;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private tenantsService: TenantsService,
    private fb: FormBuilder,
    private toast: HotToastService,
  ) {}

  ngOnInit(): void {
    this.admForm = this.fb.group({
      admissionNumberPrefix: [''],
      admissionNumberNext: [null],
    });

    const tenantId = this.authService.getActiveTenantId();
    if (tenantId) {
      this.tenantsService.getById(tenantId).subscribe({
        next: (res) => {
          this.tenant = res.data;
          const s = this.tenant.settings || {};
          this.admForm.patchValue({
            admissionNumberPrefix: s['admissionNumberPrefix'] || '',
            admissionNumberNext: s['admissionNumberNext'] ?? 1000,
          });
        },
      });
    }
  }

  get user() { return this.authService.getUser(); }

  get tenantCount(): number {
    return this.authService.getTenants().length;
  }

  toggleDarkMode(): void { this.themeService.toggleTheme(); }
  setAccentColor(color: string): void { this.themeService.setAccentColor(color); }

  get previewAdmNumber(): string {
    const prefix = this.admForm?.value?.admissionNumberPrefix || '';
    const next = Number(this.admForm?.value?.admissionNumberNext) || 0;
    const padded = String(next).padStart(4, '0');
    return prefix ? `${prefix}${padded}` : padded;
  }

  saveAdmSettings(): void {
    const tenantId = this.authService.getActiveTenantId();
    if (!tenantId) return;

    const formVal = this.admForm.value;
    const payload: any = {};

    if (formVal.admissionNumberPrefix !== undefined && formVal.admissionNumberPrefix !== null) {
      payload['admissionNumberPrefix'] = formVal.admissionNumberPrefix;
    }
    if (formVal.admissionNumberNext !== undefined && formVal.admissionNumberNext !== null && formVal.admissionNumberNext !== '') {
      payload['admissionNumberNext'] = Number(formVal.admissionNumberNext);
    }

    if (Object.keys(payload).length === 0) {
      this.toast.info('No changes to save');
      return;
    }

    this.saving = true;
    this.tenantsService.updateSettings(tenantId, payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.tenant = res.data;
        this.toast.success('Admission number settings saved');
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'Failed to save settings');
      },
    });
  }
}
