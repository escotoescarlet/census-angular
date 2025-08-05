import { Injectable } from '@angular/core';
import { StorageService } from '../../storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

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

  getBenefits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.server}/benefits`, {
      headers: this.getAuthHeaders()
    });
  }

  removeAdminFromGroup(groupId: number, accountId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.server}/groups/${groupId}/admins/${accountId}`,
      { headers: this.getAuthHeaders() }
    );
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

  updateGroupBenefits(groupId: number, benefits: { id: number; enabled: boolean }[]): Observable<any> {
    return this.http.patch<any>(
      `${this.server}/groups/${groupId}/benefits`,
      { benefits },
      { headers: this.getAuthHeaders() }
    );
  }

































}
