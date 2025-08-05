import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './environments/environment';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';

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
      'Accept': 'application/json',
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






}
