import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storageSubject = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setItem(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      console.warn('Attempting to access localStorage on server.' + this.platformId);
    }
  }

  getItem(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } else {
      console.warn('Attempting to access localStorage on server.' + this.platformId);
      return null;
    }
  }

  removeItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      console.error('localStorage is not available');
    }
  }

  clear(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    } else {
      console.error('localStorage is not available');
    }
  }
}
