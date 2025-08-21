import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  public server: string = environment.apiUrl;

  constructor(private http: HttpClient,
    private storageService: StorageService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getItem('auth_token');
    if (!token) {
      console.warn('Auth token not found');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  downloadReportBenefit(benefitId: string, startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('benefit_id', benefitId)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.server}/report/benefits/export`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadMemberStatus(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.server}/report/members/status/export`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadSnaphostEnrollment(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.server}/report/members/snapshot_enrollment/export`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadDownloadBillingReport(): Observable<Blob> {
    return this.http.get(`${this.server}/report/export_company_benefits_report`, {
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadGroupReport(): Observable<Blob> {
    return this.http.get(`${this.server}/report/groups/export_group_report`, {
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadSpanishSpeakersReport(): Observable<Blob> {
    return this.http.get(`${this.server}/report/member/export_members_spanish_speak`, {
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadDuplicatedReport(): Observable<Blob> {
    return this.http.get(
      `${this.server}/report/member/members_duplicated_export`,
      { responseType: 'blob', headers: this.getAuthHeaders() }
    );
  }

  downloadEmptyBenefitsReport(): Observable<Blob> {
    return this.http.get(
      `${this.server}/report/member/report_blank_benefits`,
      { responseType: 'blob', headers: this.getAuthHeaders() }
    );
  }

  downloadCompanyMemberEnrollment(company_id: string, startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('company_id', company_id)
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get(`${this.server}/report/companies/members/enrollment/export`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  downloadCompaniesCustomReport(params: { company_ids: string }) {
    return this.http.get(`${this.server}/report/companies/custom_export`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }


}
