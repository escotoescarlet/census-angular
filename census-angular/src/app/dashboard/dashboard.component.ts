import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessagesComponent } from '../messages/messages.component';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    MessagesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  public body: any = {};
  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  constructor(private router: Router, 
    private storage: StorageService) {
  }

  ngOnInit(): void {
    this.buildSidebar();
  }

  private buildSidebar() {
    let data: any = this.storage.getItem('_user');

    this.body = {
      name: data?.name,
      email: data?.email,
      tabs: [
        { name: 'Dashboard', link: '/home/dashboard', icon: 'bi bi-grid-1x2', hasBadge: false },
        { name: 'Groups', link: '/home/groups', icon: 'bi bi-collection', hasBadge: false },
        { name: 'Companies', link: '/home/companies', icon: 'bi bi-building', hasBadge: true, badgeCount: 0 },
        { name: 'Members', link: '/home/members', icon: 'bi bi-people', hasBadge: false },
        { name: 'Logs', link: '/home/logs', icon: 'bi bi-distribute-vertical', hasBadge: false },
      ]
    };
  }

}
