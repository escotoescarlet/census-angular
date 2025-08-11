import {Component} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";

declare var bootstrap: any;

interface AdminElement {
  title: string;
  description: string;
  icon?: string;
  route: string;
}

@Component({
  selector: 'app-admin-codifier',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './admin-codifier.component.html',
  styleUrl: './admin-codifier.component.css'
})
export class AdminCodifierComponent {

  cards: AdminElement[] = [
    {
      title: 'Manage Tags',
      description: 'Manage and modify the tags used in the app.',
      icon: 'bi-tags',
      route: '/main/admin/tags'
    },
    {
      title: 'Manage Benefits',
      description: 'Manage the benefits available to users.',
      icon: 'bi-gift',
      route: '/main/admin/benefits'
    }
  ];

  constructor() {
  }

}
