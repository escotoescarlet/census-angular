import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessagesComponent } from '../messages/messages.component';
import { HeaderNavComponent } from '../header-nav/header-nav.component';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    MessagesComponent,
    HeaderNavComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  public body: any = {};
  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  constructor(private router: Router, 
    private storage: StorageService) {
  }

  ngOnInit(): void {
    const token = this.storage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.buildSidebar();
  }

  private buildSidebar() {
    let data: any = this.storage.getItem('_user');

    this.body = {
      name: data?.name,
      email: data?.email,
      tabs: [
        { name: 'Dashboard', link: '/main/dashboard', icon: 'bi bi-grid-1x2', hasBadge: false },
        { name: 'Groups', link: '/main/groups', icon: 'bi bi-collection', hasBadge: false },
        { name: 'Companies', link: '/main/companies', icon: 'bi bi-building', hasBadge: true, badgeCount: 0 },
        { name: 'Members', link: '/main/members', icon: 'bi bi-people', hasBadge: false },
        { name: 'Logs', link: '/main/logs', icon: 'bi bi-distribute-vertical', hasBadge: false },
      ]
    };
  }

}
