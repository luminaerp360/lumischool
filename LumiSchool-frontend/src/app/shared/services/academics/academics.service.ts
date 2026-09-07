import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  ApiResponse,
  Subject,
  SubjectAssignment,
} from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class AcademicsService {
  private apiUrl = `${environment.apiUrl}/academics`;

  constructor(private http: HttpClient) {}

  // Subjects
  createSubject(data: Partial<Subject>): Observable<ApiResponse<Subject>> {
    return this.http.post<ApiResponse<Subject>>(
      `${this.apiUrl}/subjects`,
      data,
    );
  }

  getSubjects(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<Subject[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Subject[]>>(`${this.apiUrl}/subjects`, {
      params: httpParams,
    });
  }

  getSubjectById(id: string): Observable<ApiResponse<Subject>> {
    return this.http.get<ApiResponse<Subject>>(`${this.apiUrl}/subjects/${id}`);
  }

  updateSubject(
    id: string,
    data: Partial<Subject>,
  ): Observable<ApiResponse<Subject>> {
    return this.http.patch<ApiResponse<Subject>>(
      `${this.apiUrl}/subjects/${id}`,
      data,
    );
  }

  // Assignments
  getAssignments(
    params: {
      classId?: string;
      teacherId?: string;
      academicYear?: string;
    } = {},
  ): Observable<ApiResponse<SubjectAssignment[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<SubjectAssignment[]>>(
      `${this.apiUrl}/assignments`,
      { params: httpParams },
    );
  }

  createAssignment(
    data: Partial<SubjectAssignment>,
  ): Observable<ApiResponse<SubjectAssignment>> {
    return this.http.post<ApiResponse<SubjectAssignment>>(
      `${this.apiUrl}/assignments`,
      data,
    );
  }

  getAssignmentsByClass(
    classId: string,
  ): Observable<ApiResponse<SubjectAssignment[]>> {
    return this.http.get<ApiResponse<SubjectAssignment[]>>(
      `${this.apiUrl}/assignments/class/${classId}`,
    );
  }

  getAssignmentsByTeacher(
    teacherId: string,
  ): Observable<ApiResponse<SubjectAssignment[]>> {
    return this.http.get<ApiResponse<SubjectAssignment[]>>(
      `${this.apiUrl}/assignments/teacher/${teacherId}`,
    );
  }

  updateAssignment(
    id: string,
    data: Partial<SubjectAssignment>,
  ): Observable<ApiResponse<SubjectAssignment>> {
    return this.http.patch<ApiResponse<SubjectAssignment>>(
      `${this.apiUrl}/assignments/${id}`,
      data,
    );
  }

  deleteAssignment(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/assignments/${id}`,
    );
  }
}
