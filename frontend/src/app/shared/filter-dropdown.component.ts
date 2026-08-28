import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.css',
    selector: '[appFilterDropdown]',
  standalone: true,
  imports: [FormsModule],
})
export class FilterDropdownComponent {
  @Input() label = '';
  @Input() options: string[] = [];
  @Input() selected = new Set<string>();
  @Input() activeCount = 0;
  @Output() toggle = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  open = false;
  uid = 'ff-' + Math.random().toString(36).slice(2, 8) + '-';

  @HostListener('document:click') onDocClick(): void { this.open = false; }
}
