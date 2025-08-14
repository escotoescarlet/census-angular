import { Component, OnInit } from '@angular/core';
import { BenefitsService } from '../benefits/service/benefits.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagesComponent } from '../messages/messages.component';
import { ReportsService } from './service/reports.service';
import { finalize } from 'rxjs';

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
  public selectedBenefitId: number | null = null;
  public fromDate: string = '';
  public toDate: string = '';
  public loadingBenefitReport: boolean = false;

  /**
   *
   */
  constructor(private benefitService: BenefitsService,
    private reportService: ReportsService
  ) {
  }

  ngOnInit(): void {
    this.getAllBenefits();
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


}
