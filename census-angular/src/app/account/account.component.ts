import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from '../messages/messages.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CompanyService } from '../companies/service/company.service';

declare var bootstrap: any;

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
  public checkSuperAdminChk: boolean = false;

  public accountDetails: any;
  public permissions: any[] = [];
  public paginationShow: any = {
    current: 1,
    total: 0,
    count: 0
  };
  public loadingPermissions: boolean = false;
  public currentPageShow: number = 1;
  public createForm!: FormGroup;

  public companyGroupTerm: string = '';
  public companyGroupList: any[] = [];
  public filteredCompanyGroupList: any[] = [];
  public currentCGroupPage: number = 1;
  public itemsPerPage: number = 10;
  public totalCGroupPages: number = 0;
  public permissionsMap: {
    [key: number]: {
      read: boolean;
      rw: boolean;
      admin: boolean;
      superadmin: boolean;
      entity_type: 'company' | 'group';
    };
  } = {};

  constructor(private service: ServiceService,
    private fb: FormBuilder,
    private compService: CompanyService
  ) {}

  ngOnInit(): void {
    this.initCreateAccountForm();
    this.getCompaniesAndGroupsCodif();
    this.getAccounts(this.currentPage);
  }

  getCompaniesAndGroupsCodif() {
    this.service.getCompaniesAndGroupsCodifiers().subscribe(
      (next: any) => {
        const all = [...(next.companies || []), ...(next.groups || [])];
        this.companyGroupList = all;
        
        this.companyGroupList.forEach(item => {
          this.permissionsMap[item.id] = { 
            read: false, 
            rw: false, 
            admin: false, 
            superadmin: false, 
            entity_type: item.type
          };
        });

        this.filterCompanyGroups();
      }, (err: any) => {
        this.showErrorMsg(err);
      }
    );
  }

  getCGroupDisplayedPages(): number[] {
    const pages: number[] = [];
    const total = this.totalCGroupPages;
    const current = this.currentCGroupPage;

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (current === 2) end = Math.min(total - 1, current + 2);
    if (current === total - 1) start = Math.max(2, current - 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  searchCompanyGroups(page: number = 1) {
    this.filterCompanyGroups(page);
  }

  filterCompanyGroups(page: number = 1) {
    const term = this.companyGroupTerm.trim().toLowerCase();
    const filtered = this.companyGroupList.filter((item) =>
      item.name.toLowerCase().includes(term)
    );

    this.totalCGroupPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentCGroupPage = page;
    const start = (this.currentCGroupPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredCompanyGroupList = filtered.slice(start, end);
  }

  initCreateAccountForm() {
    this.createForm = this.fb.group({
      billing_email: ['', [Validators.required, this.validateStrictEmail]],

      user_first_name: ['', Validators.required],
      user_last_name: ['', Validators.required],
      user_email: ['', [Validators.required, this.validateStrictEmail]],

      superadmin: [false],
      password: ['lollip0p']
    });

    this.createForm.get('superadmin')?.valueChanges.subscribe((isSuper) => {
      this.createForm.get('admin')?.setValue(isSuper, { emitEvent: false });
    });
  }

  toggleSuperadmin(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.createForm.get('superadmin')?.setValue(checked, { emitEvent: true });
    this.checkSuperAdminChk = !this.checkSuperAdminChk;
  }

  activeDesactivateSuperadmin() {
    this.service.toggleAdmin(this.accountDetails.id).subscribe({
      next: (res) => {
        this.showSuccessMsg(res.message);
        this.closeModalShowAccount();
      },
      error: (err) => {
        this.showErrorMsg(err.error?.error || 'An error occurred');
      }
    });
  }

  getAccounts(page: number = 1) {
    this.service.getAllAccounts(page, this.searchTerm, this.sort, this.direction).subscribe(
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
    this.service.getAllAccounts(page, this.searchTerm, this.sort, this.direction).subscribe(
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

  validateStrictEmail(control: AbstractControl): ValidationErrors | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(control.value) ? null : { strictEmail: true };
  }

  createAccount() {
    const form = this.createForm.value;

    const selectedPermissions = Object.entries(this.permissionsMap)
    .filter(([_, perms]) => perms.read || perms.rw || perms.admin || perms.superadmin)
    .map(([id, perms]) => ({
      entity_id: Number(id),
      entity_type: perms.entity_type,
      read: perms.read,
      rw: perms.rw,
      admin: perms.admin,
      superadmin: perms.superadmin
    }));

    const payload = {
      user: {
        email: form.user_email,
        first_name: form.user_first_name,
        last_name: form.user_last_name,
        admin: form.superadmin
      },
      account: {
        name: `${form.user_first_name} ${form.user_last_name}`,
        billing_email: form.billing_email
      },
      permissions: !form.superadmin ? selectedPermissions : []
    };

    this.service.createAccount(payload).subscribe({
      next: (res: any) => {
        this.showSuccessMsg(res.message);
        this.getAccounts(this.currentPage);
        this.closeModalCreateAccount();
      },
      error: (err: any) => this.showErrorMsg(err)
    });
  }


  closeModalCreateAccount() {
    const modalElement = document.getElementById('addModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  closeModalShowAccount() {
    const modalElement = document.getElementById('showAccountModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
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

  getCompaniesAndGroups() {

  }

  openAddAccountModal() {
    if (typeof window !== 'undefined') {
      const modalElement = document.getElementById('addGroupModal');
      if (modalElement) {
        const bootstrapModule = (window as any).bootstrap;
        if (bootstrapModule) {
          const modalInstance = bootstrapModule.Modal.getInstance(modalElement) || new bootstrapModule.Modal(modalElement);
          modalInstance.show();
        }
      }
    }
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

  showSuccessMsg(message: string) {
    this.messageInfo = message;
    this.typeMessage = "SUCCESS";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
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
