import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessagesComponent } from '../messages/messages.component';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { HeaderNavComponent } from '../header-nav/header-nav.component';
import { ServiceService } from '../service.service';
import {
  Chart,
  BarElement,
  CategoryScale,
  BarController,
  LineController,
  LineElement,     
  PointElement, 
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  providers: [

  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  public data: any = {};
  public totalEnrolled: number = 0;
  public averageGrowth: number = 0;

  public membersByState: any[] = [];


  constructor(private service: ServiceService) {
    Chart.register(
      BarElement,
      LineController,
      LineElement,
      PointElement,
      CategoryScale,
      BarController,
      LinearScale,
      Title,
      Tooltip,
      Legend
    );
  }

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
    this.buildMap();
  }

  buildChart() {
    this.service.getMembersByMonth().subscribe((data: any) => {
      const labels = data.map((d: any) =>
        new Date(d.mes).toLocaleString('en-US', { month: 'short' }).toUpperCase()
      );

      const values = data.map((d: any) => parseInt(d.cantidad_miembros));
      const ctx = document.getElementById('membersChart') as HTMLCanvasElement;

      this.averageGrowth = this.calcAverageGrowth(values);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '',
            data: values,
            fill: true,
            tension: 0.4,
            borderColor: '#006BD1',
            backgroundColor: 'rgba(0, 107, 209, 0.05)',
            borderWidth: 3,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              display: true,
              ticks: {
                color: '#A7A9B7',
                font: { weight: 'bold' }
              },
              grid: {
                display: false
              },
              border: {
                display: false
              }
            },
            y: {
              display: false
            }
          }
        }
      });

      ctx.style.backgroundColor = '#F9F9F9';
      ctx.style.borderRadius = '12px';
      ctx.style.padding = '10px';
    });
  }

  buildMap(): void {
    this.service.getMembersByState().subscribe(
      (data: any) => {
        console.log('Members by state:', data);

        this.membersByState = data;
      },
      (error: any) => {
        console.error('Error loading state members:', error);
      }
    );
  }

  calcAverageGrowth(values: number[]) {
    let growthRates: number[] = [];

    for (let i = 1; i < values.length; i++) {
      const growth = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
      growthRates.push(growth);
    }

    return Math.ceil(growthRates.reduce((sum, g) => sum + g, 0) / growthRates.length);
  }











}
