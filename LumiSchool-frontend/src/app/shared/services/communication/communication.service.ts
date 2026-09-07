import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse, Announcement, Message } from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class CommunicationService {
  private apiUrl = `${environment.apiUrl}/communication`;

  constructor(private http: HttpClient) {}

  // Announcements
  createAnnouncement(
    data: Partial<Announcement>,
  ): Observable<ApiResponse<Announcement>> {
    return this.http.post<ApiResponse<Announcement>>(
      `${this.apiUrl}/announcements`,
      data,
    );
  }

  getAnnouncements(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<Announcement[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Announcement[]>>(
      `${this.apiUrl}/announcements`,
      { params: httpParams },
    );
  }

  getAnnouncementById(id: string): Observable<ApiResponse<Announcement>> {
    return this.http.get<ApiResponse<Announcement>>(
      `${this.apiUrl}/announcements/${id}`,
    );
  }

  updateAnnouncement(
    id: string,
    data: Partial<Announcement>,
  ): Observable<ApiResponse<Announcement>> {
    return this.http.put<ApiResponse<Announcement>>(
      `${this.apiUrl}/announcements/${id}`,
      data,
    );
  }

  publishAnnouncement(id: string): Observable<ApiResponse<Announcement>> {
    return this.http.patch<ApiResponse<Announcement>>(
      `${this.apiUrl}/announcements/${id}/publish`,
      {},
    );
  }

  deleteAnnouncement(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/announcements/${id}`,
    );
  }

  // Messages
  sendMessage(data: Partial<Message>): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(
      `${this.apiUrl}/messages`,
      data,
    );
  }

  getMessages(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<Message[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/messages`, {
      params: httpParams,
    });
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/messages/unread-count`,
    );
  }

  getMessageById(id: string): Observable<ApiResponse<Message>> {
    return this.http.get<ApiResponse<Message>>(`${this.apiUrl}/messages/${id}`);
  }

  markAsRead(id: string): Observable<ApiResponse<Message>> {
    return this.http.patch<ApiResponse<Message>>(
      `${this.apiUrl}/messages/${id}/read`,
      {},
    );
  }

  archiveMessage(id: string): Observable<ApiResponse<Message>> {
    return this.http.patch<ApiResponse<Message>>(
      `${this.apiUrl}/messages/${id}/archive`,
      {},
    );
  }
}
