import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse, Guardian } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class GuardiansService {
  private apiUrl = `${environment.apiUrl}/guardians`;

  constructor(private http: HttpClient) {}

  create(data: Partial<Guardian>): Observable<ApiResponse<Guardian>> {
    return this.http.post<ApiResponse<Guardian>>(this.apiUrl, data);
  }

  getAll(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<Guardian[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Guardian[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<ApiResponse<Guardian>> {
    return this.http.get<ApiResponse<Guardian>>(`${this.apiUrl}/${id}`);
  }

  update(
    id: string,
    data: Partial<Guardian>,
  ): Observable<ApiResponse<Guardian>> {
    return this.http.patch<ApiResponse<Guardian>>(`${this.apiUrl}/${id}`, data);
  }

  getByStudent(studentId: string): Observable<ApiResponse<Guardian[]>> {
    return this.http.get<ApiResponse<Guardian[]>>(
      `${this.apiUrl}/student/${studentId}`,
    );
  }

  linkStudent(
    guardianId: string,
    studentId: string,
  ): Observable<ApiResponse<Guardian>> {
    return this.http.post<ApiResponse<Guardian>>(
      `${this.apiUrl}/${guardianId}/link-student`,
      { studentId },
    );
  }

  unlinkStudent(
    guardianId: string,
    studentId: string,
  ): Observable<ApiResponse<Guardian>> {
    return this.http.delete<ApiResponse<Guardian>>(
      `${this.apiUrl}/${guardianId}/unlink-student/${studentId}`,
    );
  }
}
