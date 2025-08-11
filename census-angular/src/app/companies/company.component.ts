import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {CompanyService} from "./service/company.service";
import {ServiceService} from "../service.service";
import {NgSelectModule} from "@ng-select/ng-select";
import {GroupService} from '../group/service/group.service';
import {TagsService} from "../tags/service/tags.service";

declare var bootstrap: any;

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent,
    NgSelectModule
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
})
export class CompanyComponent implements OnInit {

  Math = Math;

  public companies: any[] = [];
  public totalPages: number = 0;
  public currentPage: number = 1;
  public isLoading = false;

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public searchTerm: string = '';
  public sort: string = 'name';
  public direction: string = 'asc';
  public selectedTag: string = '';
  public tags: any[] = [];

  public companyForm!: FormGroup;
  public benefits: any[] = [];
  public selectedBenefits: any[] = [];
  public benefitPrices: { [key: string]: number } = {};
  public companyDetail: any;
  public activeBenefits: any[] = [];
  public selectedTagIds: number[] = [];
  public groups: any[] = [];

  public searchTermMember: string = '';
  public membersPerPage = 10;
  public currentMembersPage = 1;
  public paginatedMembers: any[] = [];
  public filteredMembers: any[] = [];

  public companyToRemove: any;

  public companyDetailEdit: any = {
    id: null,
    name: '',
    description: '',
    is_active: false,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_billing: '',
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    address: '',
    dtc_plan_id: '',
    group_id: null,
    group: {},
    not_group: false,
    tag_ids: [],
    benefits: [],
    admin_accounts: []
  };

  constructor(private fb: FormBuilder, private service: CompanyService, private groupServices: GroupService, private tagServices: TagsService) {
  }

  ngOnInit(): void {
    this.initModalCreate();
    this.loadBenefits();
    this.getCompanies(this.currentPage);
    this.getGroups()
    this.getTags();
  }

  getCompanies(page: number) {
    this.service.getCompanies(page, this.searchTerm, this.sort, this.direction, this.selectedTag).subscribe(
      (data: any) => {
        this.companies = data.companies;
        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;
      },
      (error: any) => {
        console.error('Error fetching companies', error);
      }
    );
  }

  getGroups() {
    this.groupServices.getGroups().subscribe(
      (data: any) => {
        this.groups = data.groups;
      },
      (error: any) => {
        console.error('Error fetching companies', error);
      }
    );
  }

  getTags() {
    this.tagServices.getAllTags().subscribe(
      (data: any) => {
        this.tags = data.tags;
      },
      (error: any) => {
        console.error('Error fetching tags', error);
      }
    );
  }

  onTagChange(tagId: string) {
    this.selectedTag = tagId;
    this.getCompanies(1);
  }

  clearTagFilter() {
    this.selectedTag = '';
    this.getCompanies(1);
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getCompanies(this.currentPage);
  }

  onToggleActive(event: Event, company: any, fromModal: boolean) {
    const input = event.target as HTMLInputElement;
    const newValue = input.checked;

    this.service.toggleCompanyActive(company.id, newValue).subscribe({
      next: (response: any) => {
        company.is_active = response.company.is_active;

        if (fromModal) {
          let companyFounded: any = this.searchCompany(company.id);
          companyFounded.is_active = response.company.is_active;
        }
      },
      error: (err) => {
        console.error('Error updating status', err);
        company.is_active = !newValue;
      }
    });
  }

  toggleGroupSelection() {
    const notGroupChecked = this.companyForm.get('not_group')?.value;
    const groupIdControl = this.companyForm.get('group_id');

    if (notGroupChecked) {
      groupIdControl?.disable();
      groupIdControl?.setValue('');
    } else {
      groupIdControl?.enable();
    }
  }

  toggleEditCompanyGroupSelection() {
    if (this.companyDetailEdit.not_group) {
      this.companyDetailEdit.group_id = null;
    }
  }

  searchCompany(id: number): any {
    return this.companies.find(group => group.id == id);
  }

  updatePaginatedMembers(): void {
    const start = (this.currentMembersPage - 1) * this.membersPerPage;
    const end = start + this.membersPerPage;
    this.paginatedMembers = this.filteredMembers.slice(start, end);
  }

  readyToRemove(company: any) {
    this.companyToRemove = company;
  }

  showDetails(selected: any): void {
    const companyId = selected.id;

    this.service.getCompanyDetails(companyId).subscribe({
      next: (response: any) => {
        this.companyDetail = response;
        this.activeBenefits = this.companyDetail.benefits;
        this.currentMembersPage = 1;
        this.filteredMembers = this.companyDetail.members || [];
        this.updatePaginatedMembers();
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  changeMemberPage(page: number): void {
    this.currentMembersPage = page;
    this.updatePaginatedMembers();
  }

  searchMembers(): void {
    const term = this.searchTermMember.trim().toLowerCase();

    if (term) {
      this.filteredMembers = this.companyDetail.members.filter((member: any) =>
        member.name?.toLowerCase().includes(term)
      );
    } else {
      this.filteredMembers = this.companyDetail.members;
    }

    this.currentMembersPage = 1;
    this.updatePaginatedMembers();
  }

  onToggleCompanyMemberStatus(event: any, member: any): void {
    const isChecked = event.target.checked;

    const previousStatus = member.is_active;
    member.is_active = isChecked;

    this.service.toggleCompanyMemberActive(member.id, isChecked).subscribe({
      next: (response: any) => {
        member.is_active = response.member?.is_active ?? isChecked;
      },
      error: (err) => {
        console.error('Error updating company status:', err);
        member.is_active = previousStatus; // Revert on error
      }
    });
  }

  initModalCreate() {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],

      dct_plan_id: [''],
      not_group: [false],
      group_id: [null],

      address: [''],

      contact_name: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      contact_phone: [''],

      primary_name: [''],
      primary_email: ['', [Validators.email]],
      secondary_name: [''],
      secondary_email: ['', Validators.email],

      address_billing: [''],
      contact_billing: [''],
      billing_phone: [''],
      billing_email: ['', Validators.email],

      is_active: [true],

      benefits: this.fb.array([])
    });
  }

  loadBenefits() {
    this.service.getBenefits().subscribe((benefits: any[]) => {
      this.benefits = benefits;

      const benefitControls = benefits.map(b => new FormControl(false));
      const benefitPrices = benefits.reduce((acc, b) => {
        acc[b.id] = b.price;
        return acc;
      }, {} as Record<number, number>);

      this.companyForm.setControl('benefits', new FormArray(benefitControls));
      this.benefitPrices = benefitPrices;
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getCompanies(page);
    }
  }

  toggleBenefit(id: number, name: string, checked: boolean) {
    const existingIndex = this.selectedBenefits.findIndex((b: any) => b.id === id);
    if (checked) {
      const price = this.benefitPrices[id] ?? this.benefits.find(b => b.id === id)?.price ?? 0;
      if (existingIndex === -1) {
        this.selectedBenefits.push({id, name, price, enabled: true});
      } else {
        this.selectedBenefits[existingIndex].enabled = true;
        this.selectedBenefits[existingIndex].price = price;
      }
    } else {
      if (existingIndex !== -1) {
        this.selectedBenefits[existingIndex].enabled = false;
      } else {
        this.selectedBenefits.push({id, name, price: 0, enabled: false});
      }
    }
  }

  updateBenefitPrice(id: number, value: string) {
    const price = parseFloat(value);
    if (!isNaN(price)) {
      this.benefitPrices[id] = price;

      const existingBenefit = this.selectedBenefits.find((b: any) => b.id === id);
      if (existingBenefit) {
        existingBenefit.price = price;
      }
    }
  }

  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  closeModalAddCompany() {
    const modalElement = document.getElementById('addCompanyModal');
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
    if (this.companyForm.invalid) return;

    this.isLoading = true;

    const data = {
      company: {
        ...this.companyForm.value,
        email: this.companyForm.value.contact_email,
        phone: this.companyForm.value.contact_phone,
        group_id: this.companyForm.get('not_group')?.value ? null : this.companyForm.get('group_id')?.value,
        tag_ids: this.selectedTagIds,
        benefits: this.selectedBenefits.map(b => ({
          id: b.id,
          name: b.name,
          price: b.price,
          enabled: b.enabled
        })),
        benefit_prices: this.benefitPrices
      }
    };

    this.service.createCompany(data).subscribe(
      (data: any) => {
        console.log('Group created', data);

        this.companyForm.reset();
        this.selectedBenefits = [];
        this.benefitPrices = {};
        this.showSuccessMsg(data.message);
        this.initModalCreate();
        this.closeModalAddCompany();
        this.getCompanies(this.currentPage);
        this.isLoading = false;
      },
      (err: any) => {
        console.error('Error creating group', err);
        this.showErrorMsg(err);
        this.companyForm.reset();
        this.closeModalAddCompany();
        this.getCompanies(this.currentPage);
        this.isLoading = false;
      }
    );
  }

  isTagSelected(tagId: number): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  toggleTagSelection(tagId: number): void {
    if (this.isTagSelected(tagId)) {
      this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagId);
    } else {
      this.selectedTagIds = [...this.selectedTagIds, tagId];
    }
  }

  prepareEditCompany(selected: any) {
    const companyId = selected.id;

    this.service.getCompanyDetails(companyId).subscribe({
      next: (response: any) => {
        this.companyDetailEdit = response;
        this.companyDetailEdit.group_id = this.companyDetailEdit.group.id;
        this.currentMembersPage = 1;
        this.filteredMembers = this.companyDetailEdit.companies || [];
        this.selectedTagIds = this.companyDetailEdit.tags.map((tag: any) => tag.id);
        this.updatePaginatedMembers();
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  removeCompanyAdminAccount(account: any): void {
    if (this.companyDetailEdit.id !== null) {
      this.service.removeAdminFromCompany(this.companyDetailEdit.id, account.account_id).subscribe(
        (data: any) => {
          this.companyDetailEdit.admin_accounts = this.companyDetailEdit.admin_accounts.filter(
            (acc: any) => acc.account_id !== account.account_id
          );
        }, (error: any) => {
          this.showErrorMsg(error);
        }
      );
    }
  }

  onSaveCompanyChanges(): void {
    const data = {
      name: this.companyDetailEdit.name,
      address: this.companyDetailEdit.address,
      dct_plan_id: this.companyDetailEdit.dtc_plan_id,
      not_group: this.companyDetailEdit.not_group,
      is_active: this.companyDetailEdit.is_active,
      contact_phone: this.companyDetailEdit.contact_phone,
      group_id: this.companyDetailEdit.group_id,
      email: this.companyDetailEdit.email,
      phone: this.companyDetailEdit.phone,
      contact_name: this.companyDetailEdit.contact_name,
      contact_email: this.companyDetailEdit.contact_email,
      address_billing: this.companyDetailEdit.billing_address,
      contact_billing: this.companyDetailEdit.contact_billing,
      billing_phone: this.companyDetailEdit.billing_phone,
      billing_email: this.companyDetailEdit.billing_email,
      benefits: this.companyDetailEdit.benefits,
      benefit_prices: this.benefitPrices,
      tag_ids: this.selectedTagIds,
    }

    this.service.updateCompany(this.companyDetailEdit.id, data).subscribe({
      next: (data: any) => {
        this.showSuccessMsg(data.message);
        this.closeModalEditCompany();
        this.getCompanies(this.currentPage);
      },
      error: (err: any) => {
        this.showErrorMsg(err);
      }
    });
  }

  isEditCompanyBenefitChecked(id: number): boolean {
    return this.companyDetailEdit.benefits?.some((b: any) => b.id === id && b.enabled === true);
  }

  getEditCompanyBenefitPrice(id: number): number | null {
    const benefit = this.companyDetailEdit.benefits?.find((b: any) => b.id === id && b.enabled === true);
    return benefit ? benefit.price : null;
  }

  onEditCompanyBenefitToggle(id: number, name: string, checked: boolean): void {
    const benefit = this.companyDetailEdit.benefits.find((b: any) => b.id === id);

    if (checked) {
      if (benefit) {
        benefit.enabled = true;
        this.benefitPrices[id] = this.companyDetailEdit.benefits.find((b: any) => b.id === id)?.price || 0;
      } else {
        this.companyDetailEdit.benefits.push({id, name, price: 0, enabled: true});
        delete this.benefitPrices[id];
      }
    } else {
      if (benefit) {
        benefit.enabled = false;
      }
    }
  }

  onEditCompanyBenefitPriceChange(id: number, value: string): void {
    const price = parseFloat(value);
    if (!isNaN(price)) {
      this.benefitPrices[id] = price;

      const existingBenefit = this.companyDetailEdit.benefits.find((b: any) => b.id === id);
      if (existingBenefit) {
        existingBenefit.price = price;
      }
    }
  }

  closeModalEditCompany() {
    const modalElement = document.getElementById('editCompanyModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  deleteCompany(): void {
    if (!this.companyToRemove || !this.companyToRemove.id) return;

    this.service.deleteCompany(this.companyToRemove.id).subscribe({
      next: (response: any) => {
        this.showSuccessMsg(response.message || 'Company removed successfully');
        this.closeRemoveCompanyModal();
        this.getCompanies(this.currentPage); // actualiza la lista
      },
      error: (error) => {
        console.error('Error deleting company', error);
        this.showErrorMsg(error);
      }
    });
  }

  closeRemoveCompanyModal() {
    const modalElement = document.getElementById('removeCompanyModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
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
}
