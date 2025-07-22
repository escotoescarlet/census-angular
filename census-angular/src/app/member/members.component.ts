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
import {NgSelectModule} from "@ng-select/ng-select";
import {MembersService} from "./service/members.service";
import {CompanyService} from "../companies/service/company.service";

declare var bootstrap: any;

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent,
    NgSelectModule
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent implements OnInit {

  Math = Math;

  public members: any[] = [];
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
  public companies: any[] = [];

  public memberForm!: FormGroup;
  public benefits: any[] = [];
  public selectedBenefits: any[] = [];
  public benefitPrices: { [key: string]: number } = {};

  public memberDetail: any;
  public activeBenefits: any[] = [];
  public selectedTagIds: number[] = [];

  public memberToRemove: any;

  public memberDetailEdit: any = {
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

  constructor(private fb: FormBuilder, private service: MembersService, private companyServices: CompanyService) {
  }

  ngOnInit(): void {
    this.initModal(null);
    this.loadBenefits();
    this.getMembers(this.currentPage);
    this.getCompanies()
    this.getTags();
  }

  getMembers(page: number) {
    this.service.getMembers(page, this.searchTerm, this.sort, this.direction, this.selectedTag).subscribe(
      (data: any) => {
        this.members = data.members;
        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;
      },
      (error: any) => {
        console.error('Error fetching companies', error);
      }
    );
  }

  getCompanies() {
    this.companyServices.getCompanies().subscribe(
      (data: any) => {
        this.companies = data.companies;
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
    this.getMembers(1);
  }

  clearTagFilter() {
    this.selectedTag = '';
    this.getMembers(1);
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getMembers(this.currentPage);
  }

  onToggleActive(event: Event, member: any, fromModal: boolean) {
    const input = event.target as HTMLInputElement;
    const newValue = input.checked;

    this.service.toggleMemberActive(member.id, newValue).subscribe({
      next: (response: any) => {
        member.is_active = response.company.is_active;

        if (fromModal) {
          let memberFounded: any = this.searchMember(member.id);
          memberFounded.is_active = response.member.is_active;
        }
      },
      error: (err) => {
        console.error('Error updating status', err);
        member.is_active = !newValue;
      }
    });
  }

  searchMember(id: number): any {
    return this.members.find(member => member.id == id);
  }

  readyToRemove(member: any) {
    this.memberToRemove = member;
  }

  showDetails(selected: any): void {
    const memberId = selected.id;

    this.service.getMemberDetails(memberId).subscribe({
      next: (response: any) => {
        this.memberDetail = response;
        this.activeBenefits = this.memberDetail.benefits;
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  changeMemberPage(page: number): void {
    this.currentPage = page;
  }

  initModal(member: any) {
    const formData = member ? {
      id: member.id,
      name: member.name,
      dct_plan_id: member.dct_plan_id,
      not_group: member.not_group,
      group_id: member.group_id,
      address: member.address,
      contact_name: member.contact_name,
      contact_email: member.contact_email,
      contact_phone: member.contact_phone,
      primary_name: member.primary_name,
      primary_email: member.primary_email,
      secondary_name: member.secondary_name,
      secondary_email: member.secondary_email,
      address_billing: member.address_billing,
      contact_billing: member.contact_billing,
      billing_phone: member.billing_phone,
      billing_email: member.billing_email,
      is_active: member.is_active,
      benefits: member.benefits
    } : {
      id: null,
      name: '',
      dct_plan_id: '',
      not_group: false,
      group_id: null,
      address: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      primary_name: '',
      primary_email: '',
      secondary_name: '',
      secondary_email: '',
      address_billing: '',
      contact_billing: '',
      billing_phone: '',
      billing_email: '',
      is_active: true,
      benefits: []
    };

    this.memberForm = this.fb.group({
      name: [formData.name, Validators.required],
      dct_plan_id: [formData.dct_plan_id],
      not_group: [formData.not_group],
      group_id: [formData.group_id],
      address: [formData.address],
      contact_name: [formData.contact_name, Validators.required],
      contact_email: [formData.contact_email, [Validators.required, Validators.email]],
      contact_phone: [formData.contact_phone],
      primary_name: [formData.primary_name],
      primary_email: [formData.primary_email, [Validators.email]],
      secondary_name: [formData.secondary_name],
      secondary_email: [formData.secondary_email, Validators.email],
      address_billing: [formData.address_billing],
      contact_billing: [formData.contact_billing],
      billing_phone: [formData.billing_phone],
      billing_email: [formData.billing_email, Validators.email],
      is_active: [formData.is_active],
      benefits: this.fb.array(formData.benefits)
    });
  }

  loadBenefits() {
    this.companyServices.getBenefits().subscribe((benefits: any[]) => {
      this.benefits = benefits;

      const benefitControls = benefits.map(b => new FormControl(false));
      const benefitPrices = benefits.reduce((acc, b) => {
        acc[b.id] = b.price;
        return acc;
      }, {} as Record<number, number>);

      this.memberForm.setControl('benefits', new FormArray(benefitControls));
      this.benefitPrices = benefitPrices;
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getMembers(page);
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


  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  closeModalAddMember() {
    const modalElement = document.getElementById('addMemberModal');
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
    if (this.memberForm.invalid) return;

    this.isLoading = true;

    const data = {
      member: {
        ...this.memberForm.value,
        email: this.memberForm.value.contact_email,
        phone: this.memberForm.value.contact_phone,
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

    this.service.createMember(data).subscribe(
      (data: any) => {
        console.log('Group created', data);

        this.memberForm.reset();
        this.selectedBenefits = [];
        this.benefitPrices = {};
        this.showSuccessMsg(data.message);
        this.initModal(null);
        this.closeModalAddMember();
        this.getMembers(this.currentPage);
        this.isLoading = false;
      },
      (err: any) => {
        console.error('Error creating group', err);
        this.showErrorMsg(err);
        this.memberForm.reset();
        this.closeModalAddMember();
        this.getMembers(this.currentPage);
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

  prepareEditMember(selected: any) {
    const memberId = selected.id;

    this.service.getMemberDetails(memberId).subscribe({
      next: (response: any) => {
        this.initModal(response)
        this.selectedTagIds = this.memberDetail.tags.map((tag: any) => tag.id);
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  closeModalEditMember(): void {
    const modalElement = document.getElementById('editMemberModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  deleteMember(): void {
    if (!this.memberToRemove || !this.memberToRemove.id) return;

    this.service.deleteMember(this.memberToRemove.id).subscribe({
      next: (response: any) => {
        this.showSuccessMsg(response.message || 'Company removed successfully');
        this.closeRemoveMemberModal();
        this.getMembers(this.currentPage); // actualiza la lista
      },
      error: (error) => {
        console.error('Error deleting company', error);
        this.showErrorMsg(error);
      }
    });
  }

  closeRemoveMemberModal() {
    const modalElement = document.getElementById('removeMemberModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }
}
