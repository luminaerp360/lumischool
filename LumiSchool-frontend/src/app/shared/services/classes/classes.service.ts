import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse, SchoolClass, Stream } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class ClassesService {
  private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient) {}

  create(data: Partial<SchoolClass>): Observable<ApiResponse<SchoolClass>> {
    return this.http.post<ApiResponse<SchoolClass>>(this.apiUrl, data);
  }

  batchCreate(data: {
    level: string;
    academicYear: string;
    createStreams?: boolean;
    streamNames?: string[];
    capacity?: number;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/batch`, data);
  }

  cloneClasses(data: {
    targetAcademicYear: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/clone`, data);
  }

  getAll(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<SchoolClass[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<SchoolClass[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<ApiResponse<SchoolClass>> {
    return this.http.get<ApiResponse<SchoolClass>>(`${this.apiUrl}/${id}`);
  }

  getStats(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/stats`);
  }

  update(
    id: string,
    data: Partial<SchoolClass>,
  ): Observable<ApiResponse<SchoolClass>> {
    return this.http.patch<ApiResponse<SchoolClass>>(
      `${this.apiUrl}/${id}`,
      data,
    );
  }

  delete(id: string): Observable<ApiResponse<SchoolClass>> {
    return this.http.delete<ApiResponse<SchoolClass>>(`${this.apiUrl}/${id}`);
  }

  createStream(data: Partial<Stream> & { classId: string }): Observable<ApiResponse<Stream>> {
    return this.http.post<ApiResponse<Stream>>(`${this.apiUrl}/streams`, data);
  }

  getStreamById(id: string): Observable<ApiResponse<Stream>> {
    return this.http.get<ApiResponse<Stream>>(`${this.apiUrl}/streams/${id}`);
  }

  getStreams(classId: string): Observable<ApiResponse<Stream[]>> {
    return this.http.get<ApiResponse<Stream[]>>(
      `${this.apiUrl}/${classId}/streams`,
    );
  }

  updateStream(
    streamId: string,
    data: Partial<Stream>,
  ): Observable<ApiResponse<Stream>> {
    return this.http.patch<ApiResponse<Stream>>(
      `${this.apiUrl}/streams/${streamId}`,
      data,
    );
  }

  deleteStream(streamId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/streams/${streamId}`,
    );
  }
}
