import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Tenant, ApiResponse } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class TenantsService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Tenant[]>> {
    return this.http.get<ApiResponse<Tenant[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Tenant>> {
    return this.http.get<ApiResponse<Tenant>>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Tenant>): Observable<ApiResponse<Tenant>> {
    return this.http.post<ApiResponse<Tenant>>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Tenant>): Observable<ApiResponse<Tenant>> {
    return this.http.patch<ApiResponse<Tenant>>(`${this.apiUrl}/${id}`, data);
  }

  updateSettings(
    id: string,
    settings: Record<string, any>,
  ): Observable<ApiResponse<Tenant>> {
    return this.http.patch<ApiResponse<Tenant>>(
      `${this.apiUrl}/${id}/settings`,
      settings,
    );
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getStats(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/stats`);
  }
}
