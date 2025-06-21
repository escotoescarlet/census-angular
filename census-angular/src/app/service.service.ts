import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  public server: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

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
