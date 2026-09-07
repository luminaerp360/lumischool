import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse, Attendance } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  mark(
    data: Partial<Attendance> | Partial<Attendance>[],
  ): Observable<ApiResponse<Attendance>> {
    return this.http.post<ApiResponse<Attendance>>(this.apiUrl, data);
  }

  syncBatch(records: Partial<Attendance>[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/sync`, { records });
  }

  getAll(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<Attendance[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Attendance[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getByClass(
    classId: string,
    params: Record<string, any> = {},
  ): Observable<ApiResponse<Attendance[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Attendance[]>>(
      `${this.apiUrl}/class/${classId}`,
      { params: httpParams },
    );
  }

  getStudentSummary(studentId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/student/${studentId}/summary`,
    );
  }
}
