import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit {

  public groups: any[] = [];

  constructor(private service: ServiceService) {
  }

  ngOnInit(): void {
    this.getGroups();
  }

  getGroups() {
    this.service.getGroups().subscribe(
      (data: any) => {
        this.groups = data;
      }, (error: any) => {
        console.log('error', error);
      }
    );
  }
}
