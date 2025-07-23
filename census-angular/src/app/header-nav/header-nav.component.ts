import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileComponent } from '../profile/profile.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../storage.service';
import { ServiceService } from '../service.service';
import { MessagesComponent } from '../messages/messages.component';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MessagesComponent
  ],
  templateUrl: './header-nav.component.html',
  styleUrl: './header-nav.component.css'
})
export class HeaderNavComponent implements OnInit {

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public latestNotifications: any[] = [];
  public unreadNotif: number = 0;

  constructor(private router: Router,
    private service: ServiceService,
    private storageService: StorageService) { 
  }

  ngOnInit(): void {
    this.getLastetsNotifications();
    this.getUnreadNotifications();
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  getLastetsNotifications() {
    this.service.getLastetsNotifications().subscribe(
      (next: any) => {
        this.latestNotifications = next;
      }, (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  getUnreadNotifications() {
    this.service.getCounterUnreadNotifications().subscribe(
      (next: any) => {
        this.unreadNotif = next.unread_count;
      }, (err: any) => {
        this.showErrorMsg(err);
      }
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

}
