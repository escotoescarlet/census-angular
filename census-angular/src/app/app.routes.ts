import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './group/group.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountsComponent } from './accounts/accounts.component';
import { NotificationsComponent } from './notifications/notifications.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'groups', component: GroupComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'accounts', component: AccountsComponent },
    { path: 'notifications', component: NotificationsComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
