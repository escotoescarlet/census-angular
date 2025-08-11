import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";
import {StorageService} from "../../storage.service";

@Injectable({
  providedIn: 'root'
})
export class TagsService {

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

  getTags(page: number = 1, searchTerm: string = '', sort: string = '', direction: string = '',selectedTag: string = '') {
    const params: any = { page };

    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sort) params.sort = sort;
    if (direction) params.direction = direction;
    if (selectedTag) params.tag_id = selectedTag;

    return this.http.get(`${this.server}/tags`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  getAllTags() {
    return this.http.get(`${this.server}/tags`, {
      headers: this.getAuthHeaders(),
    });
  }

  getTagDetail(tagId: string): Observable<any> {
    return this.http.get(`${this.server}/tags/${tagId}`,
      {headers: this.getAuthHeaders()}
    );
  }

  createTag(tagData: any) {
    return this.http.post(`${this.server}/tags`, tagData, {
      headers: this.getAuthHeaders()
    });
  }

  updateTag(id:number,tag: any): Observable<any> {
    return this.http.put<any>(
      `${this.server}/members/${id}`,
      { tag: tag },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteTag(memberId: number): Observable<any> {
    return this.http.delete(`${this.server}/members/${memberId}`, {
      headers: this.getAuthHeaders()
    });
  }

}
