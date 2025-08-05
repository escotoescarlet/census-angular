import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {StorageService} from "../../storage.service";

@Injectable({
  providedIn: 'root'
})
export class LogsService {

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

  getLogs(page: number = 1, searchTerm: string = '', sort: string = '', direction: string = '',groupId: string = '',companyId: string = '',memberId: string = '') {
    const params: any = { page };

    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sort) params.sort = sort;
    if (direction) params.direction = direction;
    if (groupId) params.group_id = groupId;
    if (companyId) params.company_id = companyId;
    if (groupId) params.member_id = memberId;

    return this.http.get(`${this.server}/logs`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getLogDetails(logId: string): Observable<any> {
    return this.http.get(`${this.server}/logs/${logId}`,
      {headers: this.getAuthHeaders()}
    );
  }

}
