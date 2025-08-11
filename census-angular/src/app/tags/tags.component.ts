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
import {TagsService} from "./service/tags.service";
import {CompanyService} from "../companies/service/company.service";
import { GroupService } from '../group/service/group.service';

declare var bootstrap: any;

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent,
    NgSelectModule
  ],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})
export class TagsComponent implements OnInit {

  Math = Math;

  public tags: any[] = [];
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
  public tagForm!: FormGroup;

  public tagToRemove: any;

  private addTagModal: any;
  private editTagModal: any;

  constructor(private fb: FormBuilder,
    private service: TagsService) {}

  ngOnInit(): void {
    this.initModal(null);
    this.getTags(1);
    this.initModalListeners();
  }

  private initModalListeners() {
    const addModalElement = document.getElementById('addTagModal');
    if (addModalElement) {
      this.addTagModal = new bootstrap.Modal(addModalElement);
      addModalElement.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
      });
    }

    const editTagElement = document.getElementById('editTagModal');
    if (editTagElement) {
      this.editTagModal = new bootstrap.Modal(editTagElement);
      editTagElement.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
      });
    }
  }

  getTags(page: number) {
    this.service.getTags(page, this.searchTerm, this.sort, this.direction).subscribe(
      (data: any) => {
        this.tags = data.tags;
        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;
      },
      (error: any) => {
        console.error('Error fetching tags', error);
      }
    );
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.getTags(this.currentPage);
  }

  searchTag(id: number): any {
    return this.tags.find(tag => tag.id == id);
  }

  readyToRemove(tag: any) {
    this.tagToRemove = tag;
  }

  initModal(tag: any) {
    const formData = tag ? {
      id: tag.id,
      name: tag.name,
    } : {
      id: null,
      name: null,
    };

    this.tagForm = this.fb.group({
      id: [formData.id],
      name: [formData.name, Validators.required],
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getTags(page);
    }
  }

  closeModalAddTag() {
    const modalElement = document.getElementById('addTagModal');
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
    if (this.tagForm.invalid) return;

    this.isLoading = true;

    const data = {
      tag: {
        ...this.tagForm.value,
      }
    };

    this.service.createTag(data).subscribe(
      (data: any) => {
        console.log('Member created', data);

        this.tagForm.reset();
        this.showSuccessMsg(data.message);
        this.initModal(null);
        this.closeModalAddTag();
        this.getTags(this.currentPage);
        this.isLoading = false;
      },
      (err: any) => {
        console.error('Error creating member', err);
        this.showErrorMsg(err);
        this.tagForm.reset();
        this.closeModalAddTag();
        this.getTags(this.currentPage);
        this.isLoading = false;
      }
    );
  }

  prepareEditTag(selected: any) {
    const tagId = selected.id;

    this.service.getTagDetail(tagId).subscribe({
      next: (response: any) => {
        this.initModal(response)
      },
      error: (error: any) => {
        this.showErrorMsg(error);
      }
    });
  }

  onSaveTagChanges(): void {

    const data = {
      ...this.tagForm.value,
    };

    this.service.updateTag(data.id, data).subscribe({
      next: (data: any) => {
        this.showSuccessMsg(data.message);
        this.closeModalEditTag();
        this.getTags(this.currentPage);
      },
      error: (err: any) => {
        this.showErrorMsg(err);
      }
    });
  }

  closeModalEditTag(): void {
    const modalElement = document.getElementById('editTagModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
      this.initModal(null)
    }
  }

  deleteTag(): void {
    if (!this.tagToRemove || !this.tagToRemove.id) return;

    this.service.deleteTag(this.tagToRemove.id).subscribe({
      next: (response: any) => {
        this.showSuccessMsg(response.message || 'Member removed successfully');
        this.closeRemoveTagModal();
        this.getTags(this.currentPage);
      },
      error: (error) => {
        console.error('Error deleting member', error);
        this.showErrorMsg(error);
      }
    });
  }

  closeRemoveTagModal() {
    const modalElement = document.getElementById('removeMemberModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }
}
