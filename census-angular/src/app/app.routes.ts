import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {GroupComponent} from './group/group.component';
import {ProfileComponent} from './profile/profile.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {MainComponent} from './main/main.component';
import {LoginComponent} from './login/login.component';
import {CompanyComponent} from "./companies/company.component";
import {MembersComponent} from "./member/members.component";
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'main', component: MainComponent, children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'groups', component: GroupComponent },
        { path: 'companies', component: CompanyComponent },
        { path: 'members', component: MembersComponent },
        { path: 'profile', component: ProfileComponent },
        { path: 'accounts', component: AccountComponent },
        { path: 'notifications', component: NotificationsComponent }
    ]},
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
