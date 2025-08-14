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

}
