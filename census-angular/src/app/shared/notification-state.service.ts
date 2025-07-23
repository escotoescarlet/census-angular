import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationStateService {
  public unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  setUnreadCount(count: number): void {
    this.unreadCount.next(count);
  }

  getUnreadCount(): number {
    return this.unreadCount.getValue();
  }
}
