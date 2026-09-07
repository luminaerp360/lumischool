import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-3 z-50 w-48">
      <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Accent Color</p>
      <div class="grid grid-cols-5 gap-2">
        <button
          *ngFor="let c of colors"
          (click)="selectColor(c)"
          class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
          [style.background-color]="c"
          [class.border-gray-800]="c === color"
          [class.dark:border-white]="c === color"
          [class.border-transparent]="c !== color"
        ></button>
      </div>
    </div>
  `,
})
export class ColorPickerComponent {
  @Input() color = '#10b981';
  @Output() colorChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  colors = [
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308',
  ];

  selectColor(c: string): void {
    this.colorChange.emit(c);
    this.close.emit();
  }
}
