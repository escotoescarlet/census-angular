import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from '../messages/messages.component';

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

  public groupForm!: FormGroup;
  public benefits: any[] = [];
  public selectedBenefits: string[] = [];
  public benefitPrices: { [key: string]: number } = {};

  constructor(private fb: FormBuilder, private service: ServiceService) {
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

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getGroups(1);
  }

  onToggleActive(event: Event, group: any) {
    const input = event.target as HTMLInputElement;
    const newValue = input.checked;

    this.service.toggleGroupActive(group.id, newValue).subscribe({
      next: (response: any) => {
        group.is_active = response.group.is_active;
      },
      error: (err) => {
        console.error('Error updating status', err);
        group.is_active = !newValue;
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
    this.service.getBenefits().subscribe((benefits: any[]) => {
      this.benefits = benefits;

      const benefitControls = benefits.map(b => new FormControl(false));
      const benefitPrices = benefits.reduce((acc, b) => {
        acc[b.id] = b.price;
        return acc;
      }, {} as Record<number, number>);

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
        console.log('Group created', data);
        
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
        console.error('Error creating group', err);
        this.showErrorMsg(err);
        this.groupForm.reset();
        this.closeModalAddGroup();
        this.isLoading = false;
      }
    );
  }























































}
