import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  public server: string = environment.apiUrl;

  constructor(private http: HttpClient,
    private storageService: StorageService
  ) { }

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

  login(data: { email: string, password: string }) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      email: data.email,
      password: data.password
    };

    return this.http.post(
      `${environment.apiUrl}/auth`,
      body,
      { headers }
    );
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

  getMembersByState() {
    return this.http.get(`${this.server}/dashboard/members_by_state`,
      {headers: this.getAuthHeaders()}
    );
  }

  getGroups() {
    return this.http.get(`${this.server}/groups`, {
      headers: this.getAuthHeaders()
    });
  }


}
