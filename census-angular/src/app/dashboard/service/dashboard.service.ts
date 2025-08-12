import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../storage.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

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
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  getDashboardData() {
    return this.http.get(
      `${this.server}/dashboard/show`,
      {headers: this.getAuthHeaders()}
    );
  }

  getMembersByMonth() {
    return this.http.get(
      `${this.server}/dashboard/consulta_miembros`,
      {headers: this.getAuthHeaders()}
    );
  }

  getMembersByState() {
    return this.http.get(`${this.server}/dashboard/members_by_state`,
      {headers: this.getAuthHeaders()}
    );
  }

  getMembersByStateTop5() {
    return this.http.get(
      `${this.server}/dashboard/by_state`,
      { headers: this.getAuthHeaders() }
    );
  }

  getTotalEnrolled() {
    return this.http.get(
      `${this.server}/dashboard/total_enrolled_last_six_month`,
      {headers: this.getAuthHeaders()}
    );
  }

  getLastetsNotifications() {
    return this.http.get(
      `${this.server}/notifications`,
      {headers: this.getAuthHeaders()}
    );
  }
}
