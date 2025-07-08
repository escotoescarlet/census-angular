import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfileComponent } from '../profile/profile.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header-nav.component.html',
  styleUrl: './header-nav.component.css'
})
export class HeaderNavComponent {

  constructor(private router: Router,
    private storageService: StorageService) { 
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

}
