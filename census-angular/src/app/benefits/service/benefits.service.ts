import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {StorageService} from "../../storage.service";

@Injectable({
  providedIn: 'root'
})
export class BenefitsService {

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

  getBenefits(page: number = 1, searchTerm: string = '', sort: string = '', direction: string = '',selectedTag: string = '') {
    const params: any = { page };

    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sort) params.sort = sort;
    if (direction) params.direction = direction;
    if (selectedTag) params.tag_id = selectedTag;

    return this.http.get(`${this.server}/benefits`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getAllBenefits() {
    return this.http.get(`${this.server}/benefits`, {
      headers: this.getAuthHeaders(),
    });
  }

  getBenefitDetail(benefitId: string): Observable<any> {
    return this.http.get(`${this.server}/benefits/${benefitId}`,
      {headers: this.getAuthHeaders()}
    );
  }

  createBenefit(benefitData: any) {
    return this.http.post(`${this.server}/benefits`, benefitData, {
      headers: this.getAuthHeaders()
    });
  }

  updateBenefit(id:number,benefit: any): Observable<any> {
    return this.http.put<any>(
      `${this.server}/benefits/${id}`,
      { benefit: benefit },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteBenefit(benefitId: number): Observable<any> {
    return this.http.delete(`${this.server}/benefits/${benefitId}`, {
      headers: this.getAuthHeaders()
    });
  }

}
