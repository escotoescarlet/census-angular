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

  toggleGroupActive(groupId: number, isActive: boolean) {
    return this.http.patch(`${this.server}/groups/${groupId}/toggle_active`,
      { is_active: isActive },
      { headers: this.getAuthHeaders() }
    );
  }

  toggleCompanyActive(companyId: number, isActive: boolean) {
    return this.http.patch(`${this.server}/companies/${companyId}/toggle_active`,
      { is_active: isActive },
      { headers: this.getAuthHeaders() }
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

  updateGroupBenefits(groupId: number, benefits: { id: number; enabled: boolean }[]): Observable<any> {
    return this.http.patch<any>(
      `${this.server}/groups/${groupId}/benefits`,
      { benefits },
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

  getAllAccounts(page: number = 1, searchTerm: string = '') {
    let params: any = {
      page,
      q: searchTerm
    };

    return this.http.get(
      `${this.server}/accounts`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  getAccountDetails(accountId: number) {
    return this.http.get(
      `${this.server}/accounts/${accountId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAccountPermissions(accountId: number, page: number = 1, perPage: number = 10) {
    return this.http.get(
      `${this.server}/accounts/${accountId}/permissions?page=${page}&per_page=${perPage}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getMembersByState() {
    return this.http.get(`${this.server}/dashboard/members_by_state`,
      {headers: this.getAuthHeaders()}
    );
  }

  removeAdminFromGroup(groupId: number, accountId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.server}/groups/${groupId}/admins/${accountId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getGroups(page: number = 1, searchTerm: string = '', sort: string = '', direction: string = '') {
    const params: any = { page };

    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sort) params.sort = sort;
    if (direction) params.direction = direction;

    return this.http.get(`${this.server}/groups`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  updateGroup(group: any): Observable<any> {
    return this.http.put<any>(
      `${this.server}/groups/${group.id}`,
      { group: group },
      { headers: this.getAuthHeaders() }
    );
  }

  getGroupDetails(groupId: string): Observable<any> {
    return this.http.get(`${this.server}/groups/${groupId}`,
      {headers: this.getAuthHeaders()}
    );
  }

  createGroup(groupData: any) {
    return this.http.post(`${this.server}/groups`, groupData, {
      headers: this.getAuthHeaders()
    });
  }

  getBenefits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.server}/benefits`, {
      headers: this.getAuthHeaders()
    });
  }






}
