import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './group/group.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountsComponent } from './accounts/accounts.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import {CompanyComponent} from "./companies/company.component";

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'main', component: MainComponent, children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'groups', component: GroupComponent },
        { path: 'companies', component: CompanyComponent },
        { path: 'profile', component: ProfileComponent },
        { path: 'accounts', component: AccountsComponent },
        { path: 'notifications', component: NotificationsComponent }
    ]},
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
