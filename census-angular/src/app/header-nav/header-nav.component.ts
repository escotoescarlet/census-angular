import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfileComponent } from '../profile/profile.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { RouterModule } from '@angular/router';

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

}
