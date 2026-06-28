import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortDir } from './table-utils';

@Component({
  selector: '[appSortableHeader]',
  standalone: true,
  template: `
    <div class="d-flex align-items-center gap-1 user-select-none" style="cursor:pointer" (click)="toggle.emit()">
      <span>{{ label }}</span>
      <span class="text-muted">
        @if (dir === 'asc') {
          <i class="bi bi-caret-up-fill" style="font-size:0.6rem"></i>
        } @else if (dir === 'desc') {
          <i class="bi bi-caret-down-fill" style="font-size:0.6rem"></i>
        } @else {
          <i class="bi bi-arrow-down-up" style="font-size:0.6rem; opacity:0.3"></i>
        }
      </span>
    </div>
  `
})
export class SortableHeaderComponent {
  @Input() label = '';
  @Input() dir: SortDir = null;
  @Output() toggle = new EventEmitter<void>();
}
