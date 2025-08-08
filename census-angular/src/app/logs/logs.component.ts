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
import {LogsService} from "./service/logs.service";
import {CompanyService} from "../companies/service/company.service";
import {ServiceService} from "../service.service";
import {MembersService} from "../member/service/members.service";
import { GroupService } from '../group/service/group.service';

declare var bootstrap: any;

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent,
    NgSelectModule
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit {

  public logs: any[] = [];
  public totalPages = 0;
  public currentPage = 1;
  public isLoading = false;

  public messageInfo = '';
  public typeMessage = '';
  public showMsg = false;

  public searchTerm = '';
  public sort = 'name';
  public direction: 'asc' | 'desc' = 'asc';
  public groupId = '';
  public companyId = '';
  public memberId = '';
  public groups: any[] = [];
  public companies: any[] = [];
  public members: any[] = [];

  public logForm!: FormGroup;
  private showModalElement: any;

  constructor(
    private fb: FormBuilder,
    private service: LogsService,
    private companyServices: CompanyService,
    private groupServices: GroupService,
    private memberService: MembersService
  ) {}

  ngOnInit(): void {
    this.initModal(null);
    this.loadGroups();
    this.loadLogs();
    this.initModalListeners();
  }

  private initModalListeners() {
    const modalEl = document.getElementById('showLogModal');
    if (modalEl) {
      this.showModalElement = new bootstrap.Modal(modalEl);
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.initModal(null);
        this.isLoading = false;
      });
    }
  }

  loadLogs(page: number = 1) {
    this.currentPage = page;
    this.service.getLogs(
      page,
      this.searchTerm,
      this.sort,
      this.direction,
      this.groupId,
      this.companyId,
      this.memberId
    ).subscribe(
      (data: any) => {
        this.logs = data.logs;
        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;
      },
      error => this.showErrorMsg(error)
    );
  }

  loadGroups() {
    this.groupServices.getGroups().subscribe(
      (data: any) => { this.groups = data.groups; },
      error => this.showErrorMsg(error)
    );
  }

  loadCompaniesByGroup(groupId: string) {
    if (!groupId) {
      this.companies = [];
      this.companyId = '';
      return;
    }
    this.companyServices.getCompaniesByGroup(groupId).subscribe(
      (data: any) => { this.companies = data.companies; },
      error => this.showErrorMsg(error)
    );
  }

  loadMembersByCompany(companyId: string) {
    if (!companyId) {
      this.members = [];
      this.memberId = '';
      return;
    }
    this.memberService.getMembersByCompany(companyId).subscribe(
      (data: any) => { this.members = data.members; },
      error => this.showErrorMsg(error)
    );
  }

  onGroupChange() {
    this.companyId = '';
    this.memberId = '';
    this.loadCompaniesByGroup(this.groupId);
    this.logs = [];
    this.loadLogs(1);
  }

  onCompanyChange() {
    this.memberId = '';
    this.loadMembersByCompany(this.companyId);
    this.logs = [];
    this.loadLogs(1);
  }

  onMemberChange() {
    this.logs = [];
    this.loadLogs(1);
  }

  toggleSortDirection() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    this.loadLogs(this.currentPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadLogs(page);
    }
  }

  showDetails(log: any) {
    this.service.getLogDetails(log.id).subscribe({
      next: (response: any) => {
        this.initModal(response.log);
        this.showModalElement.show();
      },
      error: err => this.showErrorMsg(err)
    });
  }

  initModal(log: any) {
    const formData = log || {
      id: null,
      item_type: null,
      event: null,
      created_at: null,
      whodunnit: null,
      object: null,
    };
    this.logForm = this.fb.group({
      id: [formData.id],
      item_type: [formData.item_type],
      event: [formData.event],
      created_at: [formData.created_at],
      whodunnit: [formData.whodunnit],
      object: [formData.object],
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();

    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  }


  showErrorMsg(error: any) {
    this.messageInfo = error.status === 500
      ? 'Something went wrong'
      : error.error.errors?.[0] || 'Unknown error';
    this.typeMessage = 'ERROR';
    this.showMsg = true;
    setTimeout(() => this.showMsg = false, 5000);
  }
}
