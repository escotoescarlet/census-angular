import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {StorageService} from "../../storage.service";

@Injectable({
  providedIn: 'root'
})
export class MembersService {

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

  toggleMemberActive(memberId: number, isActive: boolean) {
    return this.http.patch(`${this.server}/members/${memberId}/toggle_active`,
      { is_active: isActive },
      { headers: this.getAuthHeaders() }
    );
  }

  getMembers(page: number = 1, searchTerm: string = '', sort: string = '', direction: string = '',selectedTag: string = '') {
    const params: any = { page };

    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sort) params.sort = sort;
    if (direction) params.direction = direction;
    if (selectedTag) params.tag_id = selectedTag;

    return this.http.get(`${this.server}/members`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  billingReportByBenefitsAllCompanies() {
    return this.http.get(`${this.server}/members/billing_report_by_benefits_all_companies`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
      observe: 'response'
    });
  }

  exportMembers() {
    return this.http.get(`${this.server}/members/export`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
      observe: 'response' // para leer el filename del header si viene
    });
  }

  getMembersByCompany(companyId: String) {
    return this.http.get(`${this.server}/members/by_company/${companyId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getMemberDetails(memberId: string): Observable<any> {
    return this.http.get(`${this.server}/members/${memberId}`,
      {headers: this.getAuthHeaders()}
    );
  }

  createMember(memberData: any) {
    return this.http.post(`${this.server}/members`, memberData, {
      headers: this.getAuthHeaders()
    });
  }

  updateMember(id:number,member: any): Observable<any> {
    return this.http.put<any>(
      `${this.server}/members/${id}`,
      { member: member },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteMember(memberId: number): Observable<any> {
    return this.http.delete(`${this.server}/members/${memberId}`, {
      headers: this.getAuthHeaders()
    });
  }

}
