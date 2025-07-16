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

declare var bootstrap: any;

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent
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

  public searchTermCompanies: string = '';

  public companyForm!: FormGroup;
  public benefits: any[] = [];
  public selectedBenefits: string[] = [];
  public benefitPrices: { [key: string]: number } = {};
  public companyDetail: any;
  public activeBenefits: any[] = [];

  public searchTermMember: string = '';
  public membersPerPage = 10;
  public currentMembersPage = 1;
  public paginatedMembers: any[] = [];
  public filteredMembers: any[] = [];

  public companyToRemove: any;

  constructor(private fb: FormBuilder, private service: CompanyService) {
  }

  ngOnInit(): void {
    this.initModalCreate();
    this.loadBenefits();
    this.getCompanies(this.currentPage);
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

  getTags() {
    this.service.getTags().subscribe(
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

        if(fromModal) {
          let companyFounded : any = this.searchCompany(company.id);
          companyFounded.is_active = response.company.is_active;
        }
      },
      error: (err) => {
        console.error('Error updating status', err);
        company.is_active = !newValue;
      }
    });
  }

  searchCompany(id: number) : any {
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

  onToggleBenefit(event: any, b: any) {

  }

  searchCompanies(): void {
    const term = this.searchTermCompanies.trim().toLowerCase();

    if (term) {
      this.filteredMembers = this.companyDetail.companies.filter((company: any) =>
        company.name?.toLowerCase().includes(term)
      );
    } else {
      this.filteredMembers = this.companyDetail.companies;
    }

    this.currentMembersPage = 1;
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

  onToggleCompanyStatus(event: any, company: any): void {
    const isChecked = event.target.checked;

    const previousStatus = company.is_active;
    company.is_active = isChecked;

    this.service.toggleCompanyActive(company.id, isChecked).subscribe({
      next: (response: any) => {
        company.is_active = response.company?.is_active ?? isChecked;
      },
      error: (err) => {
        console.error('Error updating company status:', err);
        company.is_active = previousStatus; // Revert on error
      }
    });
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
      group: {
        ...this.companyForm.value,
        benefits: this.selectedBenefits,
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
        this.closeModalAddGroup();
        this.getCompanies(this.currentPage);
        this.isLoading = false;
      },
      (err: any) => {
        console.error('Error creating group', err);
        this.showErrorMsg(err);
        this.companyForm.reset();
        this.closeModalAddGroup();
        this.isLoading = false;
      }
    );
  }
}
