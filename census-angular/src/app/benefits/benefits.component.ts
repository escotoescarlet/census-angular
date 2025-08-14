import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MessagesComponent} from '../messages/messages.component';
import {NgSelectModule} from "@ng-select/ng-select";
import {BenefitsService} from "./service/benefits.service";

declare var bootstrap: any;

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent,
    NgSelectModule
  ],
  templateUrl: './benefits.component.html',
  styleUrl: './benefits.component.css'
})
export class BenefitsComponent implements OnInit {

  Math = Math;

  public benefits: any[] = [];
  public totalPages: number = 0;
  public currentPage: number = 1;
  public isLoading = false;

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public searchTerm: string = '';
  public sort: string = 'name';
  public direction: string = 'asc';
  public selectedBenefit: string = '';
  public benefitForm!: FormGroup;

  public benefitToRemove: any;

  private addTagModal: any;
  private editTagModal: any;

  constructor(private fb: FormBuilder,
    private service: BenefitsService) {}

  ngOnInit(): void {
    this.initModal(null);
    this.getBenefits(1);
    this.initModalListeners();
  }

  private initModalListeners() {
    const addModalElement = document.getElementById('addBenefitModal');
    if (addModalElement) {
      this.addTagModal = new bootstrap.Modal(addModalElement);
      addModalElement.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
      });
    }

    const editTagElement = document.getElementById('editBenefitModal');
    if (editTagElement) {
      this.editTagModal = new bootstrap.Modal(editTagElement);
      editTagElement.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
      });
    }
  }

  getBenefits(page: number) {
    this.service.getBenefits(page, this.searchTerm, this.sort, this.direction).subscribe(
      (data: any) => {
        this.benefits = data.benefits;
        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;
      },
      (error: any) => {
        console.error('Error fetching benefit', error);
      }
    );
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getBenefits(this.currentPage);
  }

  searchBenefit(id: number): any {
    return this.benefits.find(benefit => benefit.id == id);
  }

  readyToRemove(benefit: any) {
    this.benefitToRemove = benefit;
  }

  initModal(benefit: any) {
    const formData = benefit ? {
      id: benefit.id,
      name: benefit.name,
      code: benefit.code,
      price: benefit.price,
      description: benefit.description,
    } : {
      id: null,
      name: null,
      code: null,
      price: null,
      description: null,
    };

    this.benefitForm = this.fb.group({
      id: [formData.id],
      name: [formData.name, Validators.required],
      code: [formData.code, Validators.required],
      price: [formData.price],
      description: [formData.description],
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getBenefits(page);
    }
  }

  closeModalAddBenefit() {
    const modalElement = document.getElementById('addBenefitModal');
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
    if (this.benefitForm.invalid) return;

    this.isLoading = true;

    const data = {
      benefit: {
        ...this.benefitForm.value,
      }
    };

    this.service.createBenefit(data).subscribe(
      (data: any) => {
        console.log('Benefit created', data);

        this.benefitForm.reset();
        this.showSuccessMsg(data.message);
        this.initModal(null);
        this.closeModalAddBenefit();
        this.getBenefits(this.currentPage);
        this.isLoading = false;
      },
      (err: any) => {
        console.error('Error creating benefit', err);
        this.showErrorMsg(err);
        this.benefitForm.reset();
        this.closeModalAddBenefit();
        this.getBenefits(this.currentPage);
        this.isLoading = false;
      }
    );
  }

  prepareEditBenefit(selected: any) {
    const benefitId = selected.id;

    this.service.getBenefitDetail(benefitId).subscribe({
      next: (response: any) => {
        this.initModal(response.benefit)
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  onSaveBenefitChanges(): void {

    const data = {
      ...this.benefitForm.value,
    };

    this.service.updateBenefit(data.id, data).subscribe({
      next: (data: any) => {
        this.showSuccessMsg(data.message);
        this.closeModalEditBenefit();
        this.getBenefits(this.currentPage);
      },
      error: (err: any) => {
        this.showErrorMsg(err);
      }
    });
  }

  closeModalEditBenefit(): void {
    const modalElement = document.getElementById('editBenefitModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
      this.initModal(null)
    }
  }

  deleteBenefit(): void {
    if (!this.benefitToRemove || !this.benefitToRemove.id) return;

    this.service.deleteBenefit(this.benefitToRemove.id).subscribe({
      next: (response: any) => {
        this.showSuccessMsg(response.message || 'Benefit removed successfully');
        this.closeRemoveBenefitModal();
        this.getBenefits(this.currentPage);
      },
      error: (error) => {
        console.error('Error deleting benefit', error);
        this.showErrorMsg(error);
      }
    });
  }

  closeRemoveBenefitModal() {
    const modalElement = document.getElementById('removeBenefitModal');
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
