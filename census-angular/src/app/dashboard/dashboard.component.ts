import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessagesComponent } from '../messages/messages.component';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { HeaderNavComponent } from '../header-nav/header-nav.component';
import { ServiceService } from '../service.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  public data: any = {};
  public totalEnrolled: number = 0;

  constructor(private service: ServiceService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getDashboardData().subscribe((response: any) => {
      this.data = response;
    });

    this.service.getTotalEnrolled().subscribe((response: any) => {
      this.totalEnrolled = response.total;
    });

    this.buildChart();
  }

  buildChart() {
    this.service.getMembersByMonth().subscribe((data: any) => {
      const labels = data.map((d: any) =>
        new Date(d.mes).toLocaleString('default', { month: 'short', year: 'numeric' })
      );
      const valores = data.map((d: any) => parseInt(d.cantidad_miembros));

      const ctx = document.getElementById('miembrosChart') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Miembros por mes',
            data: valores,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }








}
