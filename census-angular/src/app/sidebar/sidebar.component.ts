import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../storage.service';
import { CommonModule } from '@angular/common';
import { WindowServiceService } from '../window-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  providers: [
    StorageService,
    WindowServiceService
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnChanges {

  @Input() body: any;
  public name: string = '';
  public email: string = '';
  public tabs: any[] = [];
  public limitSpace: boolean = true;
  public avatar: string = '';

  public windowWidth: number = 0;
  public windowHeight: number = 0;

  public avatarWidth: number = 60;
  public avatarHeight: number = 60;

  public isSpecialist: boolean = false;

  constructor(private router: Router, 
    private storageService: StorageService,
    private windowService: WindowServiceService) {
    this.getWindowSize();
  }

  getWindowSize() {
    const window = this.windowService.nativeWindow;
    if (window) {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;

      this.limitSpace = this.windowWidth >= 1000;

      if(this.limitSpace) {
        this.avatarWidth = 50;
        this.avatarHeight = 50;
      } else {
        this.avatarWidth = 30;
        this.avatarHeight = 30;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.getWindowSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['body'] && changes['body'].currentValue) {
      this.updateUserDetails();
    }
  }

  updateUserDetails() {
    this.name = this.body.name;
    this.email = this.body.email;
    this.tabs = this.body.tabs;
    this.avatar = this.body.avatar;
    //this.getAvatar();
  }

  /*private getAvatar() {
    this.service.getAvatar(this.name).subscribe(
      (data: any) => {
        if(data.response) {
          this.avatar = this.service.buildServerImage(data.response);
        }
      }, (error: any) => {
        this.avatar = '';
      }
    );
  }*/

  logout() {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }
}