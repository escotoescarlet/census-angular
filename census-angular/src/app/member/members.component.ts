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
import { GroupService } from '../group/service/group.service';

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
  public groups: any[] = [];
  public filteredCompanies: any[] = [];

  public memberForm!: FormGroup;
  public benefits: any[] = [];
  public selectedBenefits: any[] = [];
  public benefitPrices: { [key: string]: number } = {};

  public memberDetail: any;
  public activeBenefits: any[] = [];
  public selectedTagIds: number[] = [];

  public memberToRemove: any;

  private addMemberModal: any;
  private editMemberModal: any;

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

  constructor(private fb: FormBuilder, 
    private service: MembersService, 
    private companyServices: CompanyService, 
    private groupServices: GroupService) {}

  ngOnInit(): void {
    this.initModal(null);
    this.loadBenefits();
    this.getMembers(this.currentPage);
    this.getGroups()
    this.getTags();
    this.initModalListeners();
  }

  private initModalListeners() {
    const addModalElement = document.getElementById('addMemberModal');
    if (addModalElement) {
      this.addMemberModal = new bootstrap.Modal(addModalElement);
      addModalElement.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
        this.selectedBenefits = [];
      });
    }

    const editModalElement = document.getElementById('editMemberModal');
    if (editModalElement) {
      this.editMemberModal = new bootstrap.Modal(editModalElement);
      editModalElement.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
        this.selectedBenefits = [];
      });
    }
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

  onGroupChange() {
    const selectedGroupId = this.memberForm.get('group_id')?.value;

    this.memberForm.get('company_id')?.setValue('');

    if (selectedGroupId) {
      const selectedGroup = this.groups.find(group => group.id == selectedGroupId);

      this.filteredCompanies = selectedGroup ? selectedGroup.companies : [];
    } else {
      this.filteredCompanies = [];
    }
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
        member.is_active = response.member.is_active;

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
      company_id: member.company_id,
      group_id: member.group_id,
      is_active: member.is_active,
      primary_external_id: member.primary_external_id,
      first: member.first,
      middle: member.middle,
      last: member.last,
      address: member.address,
      address_line_2: member.address_line_2,
      city: member.city,
      state: member.state,
      zipcode: member.zipcode,
      email: member.email,
      primary_phone: member.primary_phone,
      secondary_phone: member.secondary_phone,
      gender: member.gender,
      dob: member.dob ? this.formatDateForInput(member.dob) : '',
      language: member.language,
      benefits: member.benefits || []
    } : {
      id: null,
      company_id: null,
      group_id: null,
      is_active: true,
      primary_external_id: '',
      first: '',
      middle: '',
      last: '',
      address: '',
      address_line_2: '',
      city: '',
      state: '',
      zipcode: '',
      email: '',
      primary_phone: '',
      secondary_phone: '',
      gender: '',
      dob: '',
      language: '',
      benefits: []
    };

    this.memberForm = this.fb.group({
      id: [formData.id],
      company_id: [formData.company_id, Validators.required],
      group_id: [formData.group_id, Validators.required],
      is_active: [formData.is_active],
      primary_external_id: [formData.primary_external_id],
      first: [formData.first, Validators.required],
      middle: [formData.middle],
      last: [formData.last, Validators.required],
      address: [formData.address],
      address_line_2: [formData.address_line_2],
      city: [formData.city],
      state: [formData.state],
      zipcode: [formData.zipcode],
      email: [formData.email, [Validators.required, Validators.email]],
      primary_phone: [formData.primary_phone],
      secondary_phone: [formData.secondary_phone],
      gender: [formData.gender],
      dob: [formData.dob],
      language: [formData.language],
      benefits: this.fb.array(formData.benefits)
    });
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      return dateString;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${month}-${day}-${year}`;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
      }
    } catch (e) {
      console.warn('Could not parse date:', dateString);
    }

    return dateString;
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
      this.initModal(null)
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
        dob: this.formatDateForInput(this.memberForm.value.dob),
        benefits: this.selectedBenefits.map(b =>
          b.id,
        ),
      }
    };

    this.service.createMember(data).subscribe(
      (data: any) => {
        console.log('Member created', data);

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
        console.error('Error creating member', err);
        this.showErrorMsg(err);
        this.memberForm.reset();
        this.closeModalAddMember();
        this.selectedBenefits = [];
        this.getMembers(this.currentPage);
        this.isLoading = false;
      }
    );
  }

  prepareEditMember(selected: any) {
    const memberId = selected.id;

    this.service.getMemberDetails(memberId).subscribe({
      next: (response: any) => {
        this.initModal(response)
        this.selectedBenefits = response.benefits;

        if (response.group) {
          this.memberForm.get('group_id')?.setValue(response.group.id);
          this.onGroupChange();
          setTimeout(() => {
            this.memberForm.get('company_id')?.setValue(response.company_id);
          }, 100);
        }
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  onSaveMemberChanges(): void {

    const data = {
      ...this.memberForm.value,
      dob: this.formatDateForInput(this.memberForm.value.dob),
      benefits: this.selectedBenefits.map(b =>
        b.id,
      ),
    };

    this.service.updateMember(data.id, data).subscribe({
      next: (data: any) => {
        this.showSuccessMsg(data.message);
        this.closeModalEditMember();
        this.getMembers(this.currentPage);
      },
      error: (err: any) => {
        this.showErrorMsg(err);
      }
    });
  }

  closeModalEditMember(): void {
    const modalElement = document.getElementById('editMemberModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
      this.initModal(null)
    }
  }

  deleteMember(): void {
    if (!this.memberToRemove || !this.memberToRemove.id) return;

    this.service.deleteMember(this.memberToRemove.id).subscribe({
      next: (response: any) => {
        this.showSuccessMsg(response.message || 'Member removed successfully');
        this.closeRemoveMemberModal();
        this.getMembers(this.currentPage);
      },
      error: (error) => {
        console.error('Error deleting member', error);
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
