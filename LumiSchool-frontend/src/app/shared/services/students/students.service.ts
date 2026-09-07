import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse, Student } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class StudentsService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  create(data: Partial<Student>): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.apiUrl, data);
  }

  getAll(params: Record<string, any> = {}): Observable<ApiResponse<Student[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Student[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.apiUrl}/${id}`);
  }

  update(id: string, data: Partial<Student>): Observable<ApiResponse<Student>> {
    return this.http.patch<ApiResponse<Student>>(`${this.apiUrl}/${id}`, data);
  }

  archive(id: string): Observable<ApiResponse<Student>> {
    return this.http.delete<ApiResponse<Student>>(`${this.apiUrl}/${id}`);
  }

  getByClass(classId: string): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(
      `${this.apiUrl}/class/${classId}`,
    );
  }

  getByGuardian(guardianId: string): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(
      `${this.apiUrl}/guardian/${guardianId}`,
    );
  }

  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`);
  }

  promote(data: {
    studentIds: string[];
    toGrade: number;
    toLevel: string;
    toClassId?: string;
    academicYear?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/promote`, data);
  }

  autoPromote(
    level: string,
    academicYear: string,
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/auto-promote/${level}?academicYear=${academicYear}`,
      {},
    );
  }

  transfer(
    id: string,
    data: { reason: string; destination: string; transferLetterRef?: string },
  ): Observable<ApiResponse<Student>> {
    return this.http.patch<ApiResponse<Student>>(
      `${this.apiUrl}/${id}/transfer`,
      data,
    );
  }

  bulkImport(students: Partial<Student>[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bulk-import`, {
      students,
    });
  }

  getPromotionHistory(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${id}/promotion-history`,
    );
  }
}
