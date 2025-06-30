import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MessagesComponent } from './messages/messages.component';
import { HeaderNavComponent } from './header-nav/header-nav.component';
import { StorageService } from './storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    MessagesComponent,
    HeaderNavComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

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
        { name: 'Dashboard', link: '/dashboard', icon: 'bi bi-grid-1x2', hasBadge: false },
        { name: 'Groups', link: '/groups', icon: 'bi bi-collection', hasBadge: false },
        { name: 'Companies', link: '/companies', icon: 'bi bi-building', hasBadge: true, badgeCount: 0 },
        { name: 'Members', link: '/members', icon: 'bi bi-people', hasBadge: false },
        { name: 'Logs', link: '/logs', icon: 'bi bi-distribute-vertical', hasBadge: false },
      ]
    };
  }
}
