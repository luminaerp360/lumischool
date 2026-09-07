import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  ApiResponse,
  FeeStructure,
  FeeInvoice,
  FeePayment,
} from "../../interfaces/models";

@Injectable({ providedIn: "root" })
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/finance`;

  constructor(private http: HttpClient) {}

  // Fee Structures
  createFeeStructure(
    data: Partial<FeeStructure>,
  ): Observable<ApiResponse<FeeStructure>> {
    return this.http.post<ApiResponse<FeeStructure>>(
      `${this.apiUrl}/fee-structures`,
      data,
    );
  }

  getFeeStructures(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<FeeStructure[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<FeeStructure[]>>(
      `${this.apiUrl}/fee-structures`,
      { params: httpParams },
    );
  }

  updateFeeStructure(
    id: string,
    data: Partial<FeeStructure>,
  ): Observable<ApiResponse<FeeStructure>> {
    return this.http.patch<ApiResponse<FeeStructure>>(
      `${this.apiUrl}/fee-structures/${id}`,
      data,
    );
  }

  // Invoices
  generateInvoices(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/invoices/generate`,
      data,
    );
  }

  getInvoices(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<FeeInvoice[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<FeeInvoice[]>>(`${this.apiUrl}/invoices`, {
      params: httpParams,
    });
  }

  getInvoiceById(id: string): Observable<ApiResponse<FeeInvoice>> {
    return this.http.get<ApiResponse<FeeInvoice>>(
      `${this.apiUrl}/invoices/${id}`,
    );
  }

  applyDiscount(
    invoiceId: string,
    data: { amount: number; reason: string },
  ): Observable<ApiResponse<FeeInvoice>> {
    return this.http.patch<ApiResponse<FeeInvoice>>(
      `${this.apiUrl}/invoices/${invoiceId}/discount`,
      data,
    );
  }

  // Payments
  recordPayment(data: any): Observable<ApiResponse<FeePayment>> {
    return this.http.post<ApiResponse<FeePayment>>(
      `${this.apiUrl}/payments`,
      data,
    );
  }

  getPayments(
    params: Record<string, any> = {},
  ): Observable<ApiResponse<FeePayment[]>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") httpParams = httpParams.set(k, v);
    });
    return this.http.get<ApiResponse<FeePayment[]>>(`${this.apiUrl}/payments`, {
      params: httpParams,
    });
  }

  // Summary
  getSummary(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/summary`);
  }
}
