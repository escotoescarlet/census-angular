import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from '../messages/messages.component';
import { NotificationStateService } from '../shared/notification-state.service';
import { NotificationService } from './service/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MessagesComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public currentPage: number = 1;
  public totalPages: number = 1;
  public totalCount: number = 0;

  public showLeftDots: boolean = false;
  public showRightDots: boolean = false;
  public pagesInRange: number[] = [];

  public notifications: any[] = [];
  public selectedNotif: any;

  constructor(private service: NotificationService,
    private notificationStateService: NotificationStateService
  ) {}

  ngOnInit(): void {
    this.getAllNotifications();
  }

  getAllNotifications() {
    this.service.getAllNotifications().subscribe(
      (next: any) => {
        this.notifications = next.notifications;
        this.currentPage = next.page;
        this.totalPages = next.total_pages;
        this.totalCount = next.total_count;
        this.calculatePages();
      }, (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  calculatePages(): void {
    const maxVisiblePages = 5;

    this.pagesInRange = [];
    this.showLeftDots = false;
    this.showRightDots = false;

    if (this.totalPages <= 6) {
      for (let i = 2; i < this.totalPages; i++) {
        this.pagesInRange.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        // Mostrar primeros botones intermedios y puntos al final
        this.pagesInRange = [2, 3, 4];
        this.showRightDots = true;
      } else if (this.currentPage >= this.totalPages - 2) {
        // Mostrar últimos botones intermedios y puntos al inicio
        this.pagesInRange = [
          this.totalPages - 4,
          this.totalPages - 3,
          this.totalPages - 2,
        ];
        this.showLeftDots = true;
      } else {
        // Mostrar páginas alrededor del currentPage
        this.pagesInRange = [
          this.currentPage - 1,
          this.currentPage,
          this.currentPage + 1,
        ];
        this.showLeftDots = true;
        this.showRightDots = true;
      }
    }
  }

  updatePaginationRange(): void {
    const maxVisiblePages = 5;

    this.pagesInRange = [];
    this.showLeftDots = false;
    this.showRightDots = false;

    if (this.totalPages <= 10) {
      // Mostrar todas las páginas intermedias si hay 10 o menos
      for (let i = 2; i < this.totalPages; i++) {
        this.pagesInRange.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        // Al inicio: mostrar primeras 5
        this.pagesInRange = [2, 3, 4, 5];
        this.showRightDots = true;
      } else if (this.currentPage >= this.totalPages - 3) {
        // Al final: mostrar últimas 5
        this.pagesInRange = [
          this.totalPages - 4,
          this.totalPages - 3,
          this.totalPages - 2,
          this.totalPages - 1,
        ];
        this.showLeftDots = true;
      } else {
        // En el medio: mostrar página actual ±1
        this.pagesInRange = [
          this.currentPage - 1,
          this.currentPage,
          this.currentPage + 1,
        ];
        this.showLeftDots = true;
        this.showRightDots = true;
      }
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.getAllNotificationsPage(page);
  }

  markAllAsRead() {
    this.service.markAllAsRead().subscribe(
      (next: any) => {
        this.showSuccessMsg(next.message);
        this.notificationStateService.setUnreadCount(0);
      }, (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  getAllNotificationsPage(page: number = 1) {
    this.service.getAllPageNotifications(page).subscribe(
      (res: any) => {
        this.notifications = res.notifications;
        this.currentPage = res.page;
        this.totalPages = res.total_pages;
        this.calculatePages();

        const unreadIds = this.notifications
          .filter(n => !n.read_at)
          .map(n => n.id);

        if (unreadIds.length > 0) {
          this.service.markNotificationsAsRead(unreadIds).subscribe(() => {
            
            this.service.getCounterUnreadNotifications().subscribe(
              (res: any) => {
                this.notificationStateService.setUnreadCount(res.unread_count);
              },(err) => this.showErrorMsg(err)
            );
          });
        }
      },
      (err) => this.showErrorMsg(err)
    );
  }

  showErrorMsg(error: any) {
    this.messageInfo = error.status == 500 ? "Something went wrong" : error.error.errors[0];
    this.typeMessage = "ERROR";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

  showSuccessMsg(message: string) {
    this.messageInfo = message;
    this.typeMessage = "SUCCESS";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

}
