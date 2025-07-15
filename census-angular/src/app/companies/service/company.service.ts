import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {StorageService} from "../../storage.service";

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

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

  toggleCompanyActive(companyId: number, isActive: boolean) {
    return this.http.patch(`${this.server}/companies/${companyId}/toggle_active`,
      { is_active: isActive },
      { headers: this.getAuthHeaders() }
    );
  }

  toggleCompanyMemberActive(memberId: number, isActive: boolean) {
    return this.http.patch(`${this.server}/members/${memberId}/toggle_status`,
      { is_active: isActive },
      { headers: this.getAuthHeaders() }
    );
  }

  getCompanies(page: number = 1, searchTerm: string = '', sort: string = '', direction: string = '') {
    const params: any = { page };

    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sort) params.sort = sort;
    if (direction) params.direction = direction;

    return this.http.get(`${this.server}/companies`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getCompanyDetails(companyId: string): Observable<any> {
    return this.http.get(`${this.server}/companies/${companyId}`,
      {headers: this.getAuthHeaders()}
    );
  }

  createCompany(companyData: any) {
    return this.http.post(`${this.server}/compnaies`, companyData, {
      headers: this.getAuthHeaders()
    });
  }

  getBenefits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.server}/benefits`, {
      headers: this.getAuthHeaders()
    });
  }

}
