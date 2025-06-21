import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnChanges {

  @Input() message: string = '';
  @Input() type: string = '';
  @Input() show: boolean = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue) {
      setTimeout(() => {
        this.show = false;
      }, 5000);
    }
  }

}
