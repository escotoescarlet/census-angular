import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessagesComponent } from '../messages/messages.component';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { HeaderNavComponent } from '../header-nav/header-nav.component';
import { ServiceService } from '../service.service';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

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
  Legend,
  Filler
} from 'chart.js';
import { CommonModule } from '@angular/common';
import { DashboardService } from './service/dashboard.service';

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
  public topFive: any;

  public membersByState: any[] = [];
  private root!: am5.Root;

  private stateNameToCode: Record<string, string> = {
    ALABAMA: "AL",
    ALASKA: "AK",
    ARIZONA: "AZ",
    ARKANSAS: "AR",
    CALIFORNIA: "CA",
    COLORADO: "CO",
    CONNECTICUT: "CT",
    DELAWARE: "DE",
    FLORIDA: "FL",
    GEORGIA: "GA",
    HAWAII: "HI",
    IDAHO: "ID",
    ILLINOIS: "IL",
    INDIANA: "IN",
    IOWA: "IA",
    KANSAS: "KS",
    KENTUCKY: "KY",
    LOUISIANA: "LA",
    MAINE: "ME",
    MARYLAND: "MD",
    MASSACHUSETTS: "MA",
    MICHIGAN: "MI",
    MINNESOTA: "MN",
    MISSISSIPPI: "MS",
    MISSOURI: "MO",
    MONTANA: "MT",
    NEBRASKA: "NE",
    NEVADA: "NV",
    "NEW HAMPSHIRE": "NH",
    "NEW JERSEY": "NJ",
    "NEW MEXICO": "NM",
    "NEW YORK": "NY",
    "NORTH CAROLINA": "NC",
    "NORTH DAKOTA": "ND",
    OHIO: "OH",
    OKLAHOMA: "OK",
    OREGON: "OR",
    PENNSYLVANIA: "PA",
    "RHODE ISLAND": "RI",
    "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD",
    TENNESSEE: "TN",
    TEXAS: "TX",
    UTAH: "UT",
    VERMONT: "VT",
    VIRGINIA: "VA",
    WASHINGTON: "WA",
    "WEST VIRGINIA": "WV",
    WISCONSIN: "WI",
    WYOMING: "WY",
    "DISTRICT OF COLUMBIA": "DC",
    "PUERTO RICO": "PR",
    "VIRGIN ISLANDS": "VI"
  };

  constructor(private service: DashboardService) {
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
      Legend,
      Filler
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.getTotalEnrolled();
    this.getDashboardData();
    this.getTopFiveStates();

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
    this.service.getMembersByState().subscribe((data: any) => {
      if (this.root) this.root.dispose();

      this.root = am5.Root.new("chartdiv");
      this.root.setThemes([am5themes_Animated.new(this.root)]);

      const chart = this.root.container.children.push(
        am5map.MapChart.new(this.root, {
          panX: "none",
          panY: "none",
          wheelY: "none",
          projection: am5map.geoAlbersUsa(),
        })
      );

      const usaSeries = chart.series.push(
        am5map.MapPolygonSeries.new(this.root, {
          geoJSON: am5geodata_usaLow,
          valueField: "value",
          calculateAggregates: true,
          idField: "id"
        })
      );

      const bubbleSeries = chart.series.push(
        am5map.MapPointSeries.new(this.root, {})
      );

      const nameToCode: Record<string, string> = {
        "ALABAMA": "AL", "ALASKA": "AK", "ARIZONA": "AZ", "ARKANSAS": "AR", "CALIFORNIA": "CA",
        "COLORADO": "CO", "CONNECTICUT": "CT", "DELAWARE": "DE", "FLORIDA": "FL", "GEORGIA": "GA",
        "HAWAII": "HI", "IDAHO": "ID", "ILLINOIS": "IL", "INDIANA": "IN", "IOWA": "IA",
        "KANSAS": "KS", "KENTUCKY": "KY", "LOUISIANA": "LA", "MAINE": "ME", "MARYLAND": "MD",
        "MASSACHUSETTS": "MA", "MICHIGAN": "MI", "MINNESOTA": "MN", "MISSISSIPPI": "MS", "MISSOURI": "MO",
        "MONTANA": "MT", "NEBRASKA": "NE", "NEVADA": "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ",
        "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", "OHIO": "OH",
        "OKLAHOMA": "OK", "OREGON": "OR", "PENNSYLVANIA": "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
        "SOUTH DAKOTA": "SD", "TENNESSEE": "TN", "TEXAS": "TX", "UTAH": "UT", "VERMONT": "VT",
        "VIRGINIA": "VA", "WASHINGTON": "WA", "WEST VIRGINIA": "WV", "WISCONSIN": "WI", "WYOMING": "WY",
        "DISTRICT OF COLUMBIA": "DC", "PUERTO RICO": "PR", "VIRGIN ISLANDS": "VI"
      };

      usaSeries.events.once("datavalidated", () => {
        usaSeries.mapPolygons.each((polygon: any) => {
          const fullId = polygon.dataItem?.get("id");
          const stateId = fullId?.split("-")[1];

          if (!stateId) return;

          const match = data.find((item: any) => {
            let input = item.state.trim().toUpperCase();
            if (input.length > 2) input = nameToCode[input] || input;
            return input === stateId.toUpperCase();
          });

          if (match) {
            const geo = polygon.geoCentroid();
            if (!geo) return;

            //const size = Math.max(Math.sqrt(match.members) * 1.5, 5);
            const size = 3;

            const container = am5.Container.new(this.root, {
              centerX: am5.p50,
              centerY: am5.p50,
              width: size * 2,
              height: size * 2
            });

            const circle = am5.Circle.new(this.root, {
              radius: size,
              fill: am5.color(0x006BD1),
              opacity: 0.7
            });

            circle.set("tooltipText", `${stateId}: ${match.members} members`);

            const label = am5.Label.new(this.root, {
              text: `${match.members}`,
              centerX: am5.p50,
              centerY: am5.p50,
              fontSize: 12,
              fill: am5.color(0xffffff),
              fontWeight: "bold"
            });

            container.children.push(circle);
            container.children.push(label);

            bubbleSeries.pushDataItem({
              latitude: geo.latitude,
              longitude: geo.longitude,
              state: stateId,
              members: match.members
            } as any);
            
            bubbleSeries.bullets.push((root, _series, dataItem) => {
              const context = dataItem.dataContext as any;
              const settings = dataItem as any;
              const members = settings._settings.members;
              const stateId = settings._settings.state;
              
              //const size = Math.max(Math.sqrt(members) * 1.5, 5);
              const size = 15;

              const container = am5.Container.new(root, {
                centerX: am5.p50,
                centerY: am5.p50,
                width: size * 2,
                height: size * 2
              });

              const circle = am5.Circle.new(root, {
                radius: size,
                fill: am5.color(0x006BD1),
                opacity: 0.7,
                tooltipText: `${stateId}: ${members} members`
              });

              const label = am5.Label.new(root, {
                text: `${members}`,
                centerX: am5.p50,
                centerY: am5.p50,
                fontSize: 12,
                fill: am5.color(0xffffff),
                fontWeight: "bold"
              });

              container.children.push(circle);
              container.children.push(label);

              return am5.Bullet.new(root, {
                locationX: 0.5,
                locationY: 0.5,
                sprite: container
              });
            });

          }
        });
      });
    });
  }

  calcAverageGrowth(values: number[]) {
    let growthRates: number[] = [];

    for (let i = 1; i < values.length; i++) {
      const growth = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
      growthRates.push(growth);
    }

    return Math.ceil(growthRates.reduce((sum, g) => sum + g, 0) / growthRates.length);
  }

  getTotalEnrolled() {
    this.service.getTotalEnrolled().subscribe((response: any) => {
      this.totalEnrolled = response.total;
    });
  }

  getDashboardData() {
    this.service.getDashboardData().subscribe((response: any) => {
      this.data = response;
    });
  }

  getTopFiveStates() {
    this.service.getMembersByStateTop5().subscribe((data: any) => {
      this.topFive = data;
    }, (error: any) => {
      console.log(error);
    });
  }

  getStateNameFromCode(code: string): string | undefined {
    const nameToCode: Record<string, string> = {
      "ALABAMA": "AL", "ALASKA": "AK", "ARIZONA": "AZ", "ARKANSAS": "AR", "CALIFORNIA": "CA",
      "COLORADO": "CO", "CONNECTICUT": "CT", "DELAWARE": "DE", "FLORIDA": "FL", "GEORGIA": "GA",
      "HAWAII": "HI", "IDAHO": "ID", "ILLINOIS": "IL", "INDIANA": "IN", "IOWA": "IA",
      "KANSAS": "KS", "KENTUCKY": "KY", "LOUISIANA": "LA", "MAINE": "ME", "MARYLAND": "MD",
      "MASSACHUSETTS": "MA", "MICHIGAN": "MI", "MINNESOTA": "MN", "MISSISSIPPI": "MS", "MISSOURI": "MO",
      "MONTANA": "MT", "NEBRASKA": "NE", "NEVADA": "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ",
      "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", "OHIO": "OH",
      "OKLAHOMA": "OK", "OREGON": "OR", "PENNSYLVANIA": "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
      "SOUTH DAKOTA": "SD", "TENNESSEE": "TN", "TEXAS": "TX", "UTAH": "UT", "VERMONT": "VT",
      "VIRGINIA": "VA", "WASHINGTON": "WA", "WEST VIRGINIA": "WV", "WISCONSIN": "WI", "WYOMING": "WY",
      "DISTRICT OF COLUMBIA": "DC", "PUERTO RICO": "PR", "VIRGIN ISLANDS": "VI"
    };

    const codeToName: Record<string, string> = Object.entries(nameToCode).reduce((acc, [name, abbr]) => {
      acc[abbr] = this.toTitleCase(name);
      return acc;
    }, {} as Record<string, string>);

    return codeToName[code.toUpperCase()];
  }

  toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }


}
