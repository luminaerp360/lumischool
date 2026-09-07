import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse, Exam, ExamResult } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class ExamsService {
  private apiUrl = `${environment.apiUrl}/exams`;

  constructor(private http: HttpClient) {}

  create(data: Partial<Exam>): Observable<ApiResponse<Exam>> {
    return this.http.post<ApiResponse<Exam>>(this.apiUrl, data);
  }

  getAll(params: Record<string, any> = {}): Observable<ApiResponse<Exam[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Exam[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<ApiResponse<Exam>> {
    return this.http.get<ApiResponse<Exam>>(`${this.apiUrl}/${id}`);
  }

  update(id: string, data: Partial<Exam>): Observable<ApiResponse<Exam>> {
    return this.http.put<ApiResponse<Exam>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  publish(id: string): Observable<ApiResponse<Exam>> {
    return this.http.patch<ApiResponse<Exam>>(
      `${this.apiUrl}/${id}/publish`,
      {},
    );
  }

  // Results
  submitResults(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/results`, data);
  }

  getResults(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<ExamResult[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<ExamResult[]>>(
      `${this.apiUrl}/results/list`,
      { params: httpParams },
    );
  }

  getStudentResults(
    studentId: string,
    examId?: string,
  ): Observable<ApiResponse<ExamResult[]>> {
    let httpParams = new HttpParams();
    if (examId) httpParams = httpParams.set("examId", examId);
    return this.http.get<ApiResponse<ExamResult[]>>(
      `${this.apiUrl}/results/student/${studentId}`,
      { params: httpParams },
    );
  }

  getClassResults(
    examId: string,
    classId: string,
  ): Observable<ApiResponse<ExamResult[]>> {
    return this.http.get<ApiResponse<ExamResult[]>>(
      `${this.apiUrl}/results/class/${examId}/${classId}`,
    );
  }

  getClassRanking(
    examId: string,
    classId: string,
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/results/ranking/${examId}/${classId}`,
    );
  }

  getSubjectAnalysis(
    examId: string,
    subjectId: string,
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/results/analysis/${examId}/${subjectId}`,
    );
  }
}
