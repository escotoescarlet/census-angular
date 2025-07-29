import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from '../messages/messages.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public totalPages: number = 0;
  public currentPage: number = 1;
  public isLoading = false;

  public accounts: any[] = [];
  public searchTerm: string = '';
  public sort: string = 'name';
  public direction: string = 'asc';

  public accountDetails: any;
  public permissions: any[] = [];
  public paginationShow: any = {
    current: 1,
    total: 0,
    count: 0
  };
  public loadingPermissions: boolean = false;
  public currentPageShow: number = 1;


  constructor(private service: ServiceService) {
  }

  ngOnInit(): void {
    this.getAccounts(this.currentPage);
  }

  getAccounts(page: number = 1) {
    this.service.getAllAccounts(page).subscribe(
      (next: any) => {
        this.accounts = next.accounts;
        this.totalPages = next.total_pages;
        this.currentPage = next.page;
      },
      (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  searchAccounts(page: number = 1) {
    this.service.getAllAccounts(page, this.searchTerm).subscribe(
      (next: any) => {
        this.accounts = next.accounts;
        this.totalPages = next.total_pages;
        this.currentPage = next.page;
      },
      (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getAccounts(this.currentPage);
  }

  goToPage(page: number) {
    console.log('page', page);
    console.log('total', this.totalPages);
    if (page >= 1 && page <= this.totalPages) {
      if (this.searchTerm && this.searchTerm.trim() !== '') {
        this.searchAccounts(page);
      } else {
        this.getAccounts(page);
      }
    }
  }

  goToPageShow(page: number) {
    if (page >= 1 && page <= this.paginationShow.total) {
      this.loadAccountPermissions(this.accountDetails.id, page)
    }
  }

  readyToRemove(account: any) {

  }

  onToggleActiveSuperadmin(event: any, account: any) {

  }

  showDetails(account: any) {
    this.loadAccountPermissions(account.id, this.currentPageShow);
    this.service.getAccountDetails(account.id).subscribe(
      (next: any) => {
        this.accountDetails = next;
      }, (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  loadAccountPermissions(accountId: number, page: number = 1) {
    this.service.getAccountPermissions(accountId, page).subscribe((res: any) => {
      this.permissions = res.permissions;
      this.paginationShow = {
        current: res.current_page,
        total: res.total_pages,
        count: res.total_count
      };
      this.currentPageShow = res.current_page;
      this.loadingPermissions = false;
    });
  }

  prepareEditCompany(account: any) {

  }

  getDisplayedPages(): number[] {
    const pages: number[] = [];

    const start = Math.max(2, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getDisplayedCurrentPages(): number[] {
    const pages: number[] = [];

    const start = Math.max(2, this.paginationShow.current - 2);
    const end = Math.min(this.paginationShow.total - 1, this.paginationShow.current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  onToggleActive(event: Event, company: any, fromModal: boolean) {
    const input = event.target as HTMLInputElement;
    const newValue = input.checked;

  }

  showErrorMsg(error: any) {
    this.messageInfo = error.status == 500 ? "Something went wrong" : error.error.errors[0];
    this.typeMessage = "ERROR";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

}
