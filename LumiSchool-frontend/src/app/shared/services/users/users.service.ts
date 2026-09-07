import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { LumiSchoolUser, ApiResponse } from "../../interfaces/models";

export interface SaveUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  password?: string;
  isActive?: boolean;
  tenantId?: string;
}

@Injectable({ providedIn: "root" })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<LumiSchoolUser[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<LumiSchoolUser[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<ApiResponse<LumiSchoolUser>> {
    return this.http.get<ApiResponse<LumiSchoolUser>>(`${this.apiUrl}/${id}`);
  }

  create(data: SaveUserPayload): Observable<ApiResponse<LumiSchoolUser>> {
    return this.http.post<ApiResponse<LumiSchoolUser>>(this.apiUrl, data);
  }

  update(
    id: string,
    data: Partial<SaveUserPayload>,
  ): Observable<ApiResponse<LumiSchoolUser>> {
    return this.http.patch<ApiResponse<LumiSchoolUser>>(
      `${this.apiUrl}/${id}`,
      data,
    );
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getByRole(role: string): Observable<ApiResponse<LumiSchoolUser[]>> {
    return this.http.get<ApiResponse<LumiSchoolUser[]>>(
      `${this.apiUrl}/role/${role}`,
    );
  }
}
