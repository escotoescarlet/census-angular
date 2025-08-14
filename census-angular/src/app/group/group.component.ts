import {Component, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MessagesComponent} from '../messages/messages.component';
import {GroupService} from './service/group.service';
import {BenefitsService} from "../benefits/service/benefits.service";
import {CommonModule} from "@angular/common";

declare var bootstrap: any;

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit {

  Math = Math;

  public groups: any[] = [];
  public totalPages: number = 0;
  public currentPage: number = 1;
  public isLoading = false;

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public searchTerm: string = '';
  public sort: string = 'name';
  public direction: string = 'asc';

  public searchTermCompanies: string = '';
  public searchTermEditCompanies: string = '';

  public groupForm!: FormGroup;
  public benefits: any[] = [];
  public selectedBenefits: string[] = [];
  public benefitPrices: { [key: string]: number } = {};
  public groupDetail: any;
  public activeBenefits: any[] = [];

  public companiesPerPage = 10;
  public companiesEditPerPage = 10;
  public currentCompanyPage = 1;
  public currentCompanyEditPage = 1;
  public paginatedCompanies: any[] = [];
  public paginatedEditCompanies: any[] = [];
  public filteredCompanies: any[] = [];
  public filteredCompaniesEdit: any[] = [];
  public groupToRemove: any;

  public groupDetailEdit: {
    id: number | null;
    name: string;
    description: string | null;
    is_active: boolean;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    billing_email: string | null;
    billing_phone: string | null;
    billing_address: string | null;
    address: string | null;
    benefits: any[];
    companies: any[];
    admin_accounts: any[];
  } = {
    id: null,
    name: '',
    description: '',
    is_active: false,
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    billing_email: null,
    billing_phone: null,
    billing_address: null,
    address: null,
    benefits: [],
    companies: [],
    admin_accounts: []
  };

  constructor(
    private fb: FormBuilder,
    private service: GroupService,
    private benefitsService: BenefitsService
  ) {
  }

  ngOnInit(): void {
    this.initModalCreate();
    this.loadBenefits();
    this.getGroups(this.currentPage);
  }

  getGroups(page: number) {
    this.service.getGroups(page, this.searchTerm, this.sort, this.direction).subscribe(
      (data: any) => {
        this.groups = data.groups;
        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;
      },
      (error: any) => {
        console.error('Error fetching groups', error);
      }
    );
  }

  downloadGroupMembersCsv(groupId: number) {
    this.service.downloadMembersCsv(groupId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `group-${groupId}-members-${timestamp}.csv`;

        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Error downloading CSV:', err);
      }
    });
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getGroups(1);
  }

  onToggleActive(event: Event, group: any, fromModal: boolean) {
    const input = event.target as HTMLInputElement;
    const newValue = input.checked;

    this.service.toggleGroupActive(group.id, newValue).subscribe({
      next: (response: any) => {
        group.is_active = response.group.is_active;

        if (fromModal) {
          let groupFounded: any = this.searchGroup(group.id);
          groupFounded.is_active = response.group.is_active;
        }
      },
      error: (err) => {
        console.error('Error updating status', err);
        group.is_active = !newValue;
      }
    });
  }

  searchGroup(id: number): any {
    return this.groups.find(group => group.id == id);
  }

  updatePaginatedCompanies(): void {
    const start = (this.currentCompanyPage - 1) * this.companiesPerPage;
    const end = start + this.companiesPerPage;
    this.paginatedCompanies = this.filteredCompanies.slice(start, end);
  }

  updatePaginatedEditCompanies(): void {
    const start = (this.currentCompanyEditPage - 1) * this.companiesEditPerPage;
    const end = start + this.companiesEditPerPage;
    this.paginatedEditCompanies = this.filteredCompaniesEdit.slice(start, end);
  }

  readyToRemove(group: any) {
    this.groupToRemove = group;
  }

  showDetails(selected: any): void {
    const groupId = selected.id;

    this.service.getGroupDetails(groupId).subscribe({
      next: (response: any) => {
        this.groupDetail = response;
        this.activeBenefits = this.groupDetail.benefits;
        this.currentCompanyPage = 1;
        this.filteredCompanies = this.groupDetail.companies || [];
        this.updatePaginatedCompanies();
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  prepareEditGroup(selected: any) {
    const groupId = selected.id;

    this.service.getGroupDetails(groupId).subscribe({
      next: (response: any) => {
        this.groupDetailEdit = response;
        this.currentCompanyEditPage = 1;
        this.filteredCompaniesEdit = this.groupDetailEdit.companies || [];
        this.updatePaginatedEditCompanies();
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  isArrayAndNotEmpty(arr: any): boolean {
    return Array.isArray(arr) && arr.length > 0;
  }

  changeCompanyPage(page: number): void {
    this.currentCompanyPage = page;
    this.updatePaginatedCompanies();
  }

  changeCompanyEditPage(page: number) {
    this.currentCompanyEditPage = page;
    this.updatePaginatedEditCompanies();
  }

  onToggleBenefitUpdate(event: any, b: any): void {
    if (this.groupDetailEdit.id != null) {
      const newValue = event.target.checked;

      this.service.updateGroupBenefits(this.groupDetailEdit.id, [
        {id: b.id, enabled: newValue}
      ]).subscribe({
        next: (data) => {
          b.enabled = newValue;
          this.showSuccessMsg(data.message);
        },
        error: err => {
          this.showErrorMsg(err);
          event.target.checked = !newValue;
        }
      });
    }
  }

  onToggleBenefit(event: any, b: any): void {
    if (this.groupDetail.id != null) {
      const newValue = event.target.checked;

      this.service.updateGroupBenefits(this.groupDetail.id, [
        {id: b.id, enabled: newValue}
      ]).subscribe({
        next: (data) => {
          b.enabled = newValue;
          this.showSuccessMsg(data.message);
        },
        error: err => {
          this.showErrorMsg(err);
          event.target.checked = !newValue;
        }
      });
    }
  }

  searchCompanies(): void {
    const term = this.searchTermCompanies.trim().toLowerCase();

    if (term) {
      this.filteredCompanies = this.groupDetail.companies.filter((company: any) =>
        company.name?.toLowerCase().includes(term)
      );
    } else {
      this.filteredCompanies = this.groupDetail.companies;
    }

    this.currentCompanyPage = 1;
    this.updatePaginatedCompanies();
  }

  searchCompaniesEdit(): void {
    const term = this.searchTermEditCompanies.trim().toLowerCase();

    if (term) {
      this.filteredCompaniesEdit = this.groupDetailEdit.companies.filter((company: any) =>
        company.name?.toLowerCase().includes(term)
      );
    } else {
      this.filteredCompaniesEdit = this.groupDetailEdit.companies;
    }

    this.currentCompanyEditPage = 1;
    this.updatePaginatedEditCompanies();
  }

  removeAdminAccount(account: any): void {
    if (this.groupDetailEdit.id !== null) {
      this.service.removeAdminFromGroup(this.groupDetailEdit.id, account.account_id).subscribe(
        (data: any) => {
          this.groupDetailEdit.admin_accounts = this.groupDetailEdit.admin_accounts.filter(
            acc => acc.account_id !== account.account_id
          );
        }, (error: any) => {
          this.showErrorMsg(error);
        }
      );
    }
  }

  onToggleGroupCompanyStatus(event: any, company: any): void {
    const isChecked = event.target.checked;

    const previousStatus = company.is_active;
    company.is_active = isChecked;

    this.service.toggleCompanyActive(company.id, isChecked).subscribe({
      next: (response: any) => {
        company.is_active = response.company?.is_active ?? isChecked;
      },
      error: (err) => {
        console.error('Error updating company status:', err);
        company.is_active = previousStatus;
      }
    });
  }

  onSaveChanges(): void {
    this.service.updateGroup(this.groupDetailEdit).subscribe({
      next: (data: any) => {
        this.showSuccessMsg(data.message);
        this.closeModalEditGroup();
      },
      error: (err: any) => {
        this.showErrorMsg(err);
      }
    });
  }

  initModalCreate() {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],

      contact_name: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      contact_phone: [''],

      primary_name: [''],
      primary_email: ['', [Validators.email]],
      secondary_name: [''],
      secondary_email: ['', Validators.email],

      billing_address: [''],
      billing_contact_name: [''],
      billing_phone: [''],
      billing_email: ['', Validators.email],

      is_active: [true],

      benefits: this.fb.array([])
    });
  }

  loadBenefits() {
    this.benefitsService.getBenefits().subscribe((data: any) => {
      this.benefits = data.benefits;

      const benefitControls = data.benefits.map(() => new FormControl(false));
      const benefitPrices = data.benefits.reduce(
        (acc: Record<number, number>, b: { id: number; price: number }) => {
          acc[b.id] = b.price;
          return acc;
        },
        {}
      );

      this.groupForm.setControl('benefits', new FormArray(benefitControls));
      this.benefitPrices = benefitPrices;
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getGroups(page);
    }
  }

  toggleBenefit(id: number, name: string, checked: boolean) {
    if (checked) {
      this.selectedBenefits.push(name);
      this.benefitPrices[id] = this.benefits.find(b => b.id === id)?.price || 0;
    } else {
      this.selectedBenefits = this.selectedBenefits.filter(b => b !== name);
      delete this.benefitPrices[id];
    }
  }

  updateBenefitPrice(id: number, value: string) {
    const price = parseFloat(value);
    if (!isNaN(price)) {
      this.benefitPrices[id] = price;
    }
  }

  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  closeModalAddGroup() {
    const modalElement = document.getElementById('addGroupModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  closeModalEditGroup() {
    const modalElement = document.getElementById('editGroupModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  showErrorMsg(error: any) {
    this.messageInfo = error.status == 500 ? "Something went wrong" : error.error.errors[0];
    this.typeMessage = "ERROR";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

  showSuccessMsg(message: string) {
    this.messageInfo = message;
    this.typeMessage = "SUCCESS";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

  onSubmitCreate() {
    if (this.groupForm.invalid) return;

    this.isLoading = true;

    const data = {
      group: {
        ...this.groupForm.value,
        benefits: this.selectedBenefits,
        benefit_prices: this.benefitPrices
      }
    };

    this.service.createGroup(data).subscribe(
      (data: any) => {
        this.groupForm.reset();
        this.selectedBenefits = [];
        this.benefitPrices = {};
        this.showSuccessMsg(data.message);
        this.initModalCreate();
        this.closeModalAddGroup();
        this.getGroups(this.currentPage);
        this.isLoading = false;
      },
      (err: any) => {
        this.showErrorMsg(err);
        this.groupForm.reset();
        this.closeModalAddGroup();
        this.isLoading = false;
      }
    );
  }
}
