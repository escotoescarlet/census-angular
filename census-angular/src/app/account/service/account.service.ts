import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

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

  updatePermission(payload: any) {
    return this.http.patch(
      `${this.server}/permissions/bulk_update`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  updateAccount(account: any): Observable<any> {
    return this.http.patch(`${this.server}/accounts/${account.id}`, {
      name: account.name,
      billing_email: account.billing_email,
      user_attributes: {
        id: account.user.id,
        email: account.user.email,
        preferred_language: account.user.preferred_language
      }
    }, { headers: this.getAuthHeaders() });
  }

  sendWelcomeEmail(account: any) {
    return this.http.patch(`${this.server}/accounts/${account.id}/send_welcome_email`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  getCompaniesAndGroupsCodifiers() {
    return this.http.get(
      `${this.server}/accounts/companies_groups_data`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAllAccounts(page: number = 1, searchTerm: string = '', sortBy: string = 'name', direction: string = 'asc') {
    let params: any = {
      page,
      q: searchTerm,
      sort_by: sortBy,
      direction: direction
    };

    return this.http.get(`${this.server}/accounts`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  toggleAdmin(userId: number): Observable<any> {
    return this.http.patch(
      `${this.server}/accounts/${userId}/toggle_admin`, 
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  deleteAccount(id: number) {
    return this.http.delete(`${this.server}/accounts/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAccountDetails(accountId: number) {
    return this.http.get(
      `${this.server}/accounts/${accountId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createAccount(accountData: any) {
    return this.http.post(
      `${this.server}/accounts/create_with_owner`,
      accountData,
      { headers: this.getAuthHeaders() }
    );
  }

  getAccountPermissions(accountId: number, page: number = 1, perPage: number = 10) {
    return this.http.get(
      `${this.server}/accounts/${accountId}/permissions?page=${page}&per_page=${perPage}`,
      { headers: this.getAuthHeaders() }
    );
  }

}
