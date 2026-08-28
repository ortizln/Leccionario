import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortDir } from './table-utils';

@Component({
  templateUrl: './sortable-header.component.html',
  styleUrl: './sortable-header.component.css',
    selector: '[appSortableHeader]',
  standalone: true,
})
export class SortableHeaderComponent {
  @Input() label = '';
  @Input() dir: SortDir = null;
  @Output() toggle = new EventEmitter<void>();
}
