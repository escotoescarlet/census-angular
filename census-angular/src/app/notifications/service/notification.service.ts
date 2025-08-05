import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

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

  getAllNotifications() {
    return this.http.get(
      `${this.server}/notifications/all`,
      {headers: this.getAuthHeaders()}
    );
  }

  getCounterUnreadNotifications() {
    return this.http.get(
      `${this.server}/notifications/count_unread`,
      {headers: this.getAuthHeaders()}
    );
  }

  markAllAsRead() {
    return this.http.post(
      `${this.server}/notifications/mark_all_as_read`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  getAllPageNotifications(page: number = 1) {
    return this.http.get(
      `${this.server}/notifications/all?page=${page}`,
      { headers: this.getAuthHeaders() }
    );
  }

  markNotificationsAsRead(ids: number[]) {
    return this.http.post(
      `${this.server}/notifications/mark_as_read`,
      { ids },
      { headers: this.getAuthHeaders() }
    );
  }


}
