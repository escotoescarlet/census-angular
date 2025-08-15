import { Component, OnInit } from '@angular/core';
import { BenefitsService } from '../benefits/service/benefits.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagesComponent } from '../messages/messages.component';
import { ReportsService } from './service/reports.service';
import { finalize } from 'rxjs';
import { CompanyService } from '../companies/service/company.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {

  public messageInfo: string = '';
  public typeMessage: string = '';
  public showMsg: boolean = false;

  public benefits: any[] = [];
  public companies: any[] = [];
  public selectedBenefitId: number | null = null;
  public companySelectedId: number | null = null;
  public fromDate: string = '';
  public toDate: string = '';
  public loadingBenefitReport: boolean = false;

  public fromDateMemberStatus: string = '';
  public toDateMemberStatus: string = '';
  public loadingMemberStatusReport: boolean = false;

  public fromDateSnaphostEnrollment: string = '';
  public toDateSnaphostEnrollment: string = '';
  public loadingSnaphostEnrollment: boolean = false;

  public fromDateMemberEnrollment: string = '';
  public toDateMemberEnrollment: string = '';
  public loadingMemberEnrollment: boolean = false;

  /**
   *
   */
  constructor(private benefitService: BenefitsService,
    private reportService: ReportsService,
    private companyService: CompanyService
  ) {
  }

  ngOnInit(): void {
    this.getAllBenefits();
    this.getAllCompanies();
  }

  getAllBenefits() {
    this.benefitService.getAllBenefits().subscribe(
      (data: any) => {
        this.benefits = data;
        this.selectedBenefitId = this.benefits[0].id;
      }, (error: any) => {
        this.showErrorMsg(error);
      }
    );
  }

  getAllCompanies() {
    this.companyService.getAllCompanies().subscribe(
      (data: any) => {
        this.companies = data;
        this.companySelectedId = this.companies[0].id;
      }, (error: any) => {
        this.showErrorMsg(error);
      }
    );
  }

  onDownloadBenefitReport() {
    const benefitId = String(this.selectedBenefitId);
    const startDate = this.fromDate; // 'YYYY-MM-DD'
    const endDate   = this.toDate;   // 'YYYY-MM-DD'

    this.loadingBenefitReport = true;
    
    this.reportService.downloadReportBenefit(benefitId, startDate, endDate)
    .pipe(finalize(() => this.loadingBenefitReport = false))
    .subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.showErrorMsgStr('No data found for the selected filters.');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benefits_report_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        this.showErrorMsg(err);
      }
    });
  }

  onDownloadMemberStatusReport() {
    const startDate = this.fromDateMemberStatus; // 'YYYY-MM-DD'
    const endDate   = this.toDateMemberStatus;   // 'YYYY-MM-DD'

    this.loadingMemberStatusReport = true;
    
    this.reportService.downloadMemberStatus(startDate, endDate)
    .pipe(finalize(() => this.loadingMemberStatusReport = false))
    .subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.showErrorMsgStr('No data found for the selected filters.');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `member_status_report_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        this.showErrorMsg(err);
      }
    });
  }

  onDownloadSnaphostReport() {
    const startDate = this.fromDateSnaphostEnrollment; // 'YYYY-MM-DD'
    const endDate   = this.toDateSnaphostEnrollment;   // 'YYYY-MM-DD'

    this.loadingSnaphostEnrollment = true;
    
    this.reportService.downloadSnaphostEnrollment(startDate, endDate)
    .pipe(finalize(() => this.loadingSnaphostEnrollment = false))
    .subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.showErrorMsgStr('No data found for the selected filters.');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snaphost_enrollment_report_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        this.showErrorMsg(err);
      }
    });
  }

  onDownloadCompanyMemberEnrollmentReport() {
    const companyId = String(this.companySelectedId);
    const startDate = this.fromDateMemberEnrollment; // 'YYYY-MM-DD'
    const endDate   = this.toDateMemberEnrollment;   // 'YYYY-MM-DD'

    this.loadingMemberEnrollment = true;
    
    this.reportService.downloadCompanyMemberEnrollment(companyId, startDate, endDate)
    .pipe(finalize(() => this.loadingMemberEnrollment = false))
    .subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          this.showErrorMsgStr('No data found for the selected filters.');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `company_member_enrollment_report_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        this.showErrorMsg(err);
      }
    });
  }

  showErrorMsg(error: any) {
    this.messageInfo = error.status == 500 ? "Something went wrong" : error.error.errors[0];
    this.typeMessage = "ERROR";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

  showErrorMsgStr(error: string) {
    this.messageInfo = error;
    this.typeMessage = "ERROR";
    this.showMsg = true;

    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

  isFormValid(): boolean {
    return !!this.selectedBenefitId && !!this.fromDate && !!this.toDate;
  }

  isFormMemberStatusValid(): boolean {
    return !!this.fromDateMemberStatus && !!this.toDateMemberStatus;
  }

  isSnaphostEnrollmentValid(): boolean {
    return !!this.fromDateSnaphostEnrollment && !!this.toDateSnaphostEnrollment;
  }

  isMemberEnrollmentFormValid(): boolean {
    return !!this.companySelectedId && !!this.fromDateMemberEnrollment && !!this.toDateMemberEnrollment;
  }


}
