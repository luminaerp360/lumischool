import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, tap, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  AuthResponse,
  LumiSchoolUser,
  Tenant,
  ApiResponse,
} from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUser$ = new BehaviorSubject<LumiSchoolUser | null>(null);
  private tenants$ = new BehaviorSubject<Tenant[]>([]);
  private activeTenantId$ = new BehaviorSubject<string>("");

  user$ = this.currentUser$.asObservable();
  tenantList$ = this.tenants$.asObservable();
  currentTenantId$ = this.activeTenantId$.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem("lumischool_token", res.data.accessToken);
          localStorage.setItem(
            "lumischool_refresh_token",
            res.data.refreshToken,
          );
          localStorage.setItem(
            "lumischool_user",
            JSON.stringify(res.data.user),
          );
          this.currentUser$.next(res.data.user);
        }),
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem("lumischool_refresh_token");
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem("lumischool_token", res.data.accessToken);
          localStorage.setItem(
            "lumischool_refresh_token",
            res.data.refreshToken,
          );
        }),
      );
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, {
      email,
    });
  }

  resetPassword(
    token: string,
    newPassword: string,
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  getMe(): Observable<ApiResponse<LumiSchoolUser>> {
    return this.http.get<ApiResponse<LumiSchoolUser>>(`${this.apiUrl}/me`);
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem("lumischool_token");
    localStorage.removeItem("lumischool_refresh_token");
    localStorage.removeItem("lumischool_user");
    localStorage.removeItem("lumischool_tenants");
    localStorage.removeItem("lumischool_active_tenant");
    this.currentUser$.next(null);
    this.tenants$.next([]);
    this.activeTenantId$.next("");
  }

  getToken(): string | null {
    return localStorage.getItem("lumischool_token");
  }

  getUser(): LumiSchoolUser | null {
    return this.currentUser$.value;
  }

  getTenants(): Tenant[] {
    return this.tenants$.value;
  }

  getActiveTenantId(): string {
    return this.activeTenantId$.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.role === "SUPER_ADMIN";
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  setTenantContext(tenants: Tenant[], activeTenantId = ""): void {
    const normalizedTenants = (tenants || []).map((tenant: any) => ({
      ...tenant,
      _id: this.normalizeTenantId(tenant?._id ?? tenant?.id),
    })) as Tenant[];
    const normalizedActiveTenantId = this.normalizeTenantId(activeTenantId);
    const resolvedActiveTenantId =
      normalizedActiveTenantId &&
      normalizedTenants.some(
        (tenant) => tenant._id === normalizedActiveTenantId,
      )
        ? normalizedActiveTenantId
        : normalizedTenants[0]?._id || "";

    if (normalizedTenants.length) {
      localStorage.setItem(
        "lumischool_tenants",
        JSON.stringify(normalizedTenants),
      );
    } else {
      localStorage.removeItem("lumischool_tenants");
    }

    if (resolvedActiveTenantId) {
      localStorage.setItem("lumischool_active_tenant", resolvedActiveTenantId);
    } else {
      localStorage.removeItem("lumischool_active_tenant");
    }

    this.tenants$.next(normalizedTenants);
    this.activeTenantId$.next(resolvedActiveTenantId);
  }

  private normalizeTenantId(value: any): string {
    if (typeof value === "string") {
      return value;
    }
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }

  private loadUser(): void {
    const userJson = localStorage.getItem("lumischool_user");
    if (userJson) {
      try {
        this.currentUser$.next(JSON.parse(userJson));
      } catch (e) {}
    }
    const tenantsJson = localStorage.getItem("lumischool_tenants");
    let tenants: Tenant[] = [];
    if (tenantsJson) {
      try {
        tenants = JSON.parse(tenantsJson);
      } catch (e) {}
    }
    this.setTenantContext(
      tenants,
      localStorage.getItem("lumischool_active_tenant") || "",
    );
  }
}
