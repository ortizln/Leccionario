import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: '[appFilterDropdown]',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .filter-panel {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1050;
      min-width: 200px;
      max-height: 300px;
      overflow-y: auto;
      background: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15);
      padding: 0.5rem;
    }
  `],
  template: `
    <div class="position-relative d-inline-block">
      <button class="btn btn-sm btn-outline-secondary border-0 p-0 px-1" type="button"
              style="line-height:1" (click)="open = !open; $event.stopPropagation()">
        <i class="bi bi-funnel" [class.text-primary]="activeCount > 0"
           [style.opacity]="activeCount > 0 ? 1 : 0.4"></i>
        @if (activeCount > 0) {
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-primary"
                style="font-size:0.55rem; padding:0.15em 0.35em">{{ activeCount }}</span>
        }
      </button>
      @if (open) {
        <div class="filter-panel" (click)="$event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold small">{{ label }}</span>
            @if (activeCount > 0) {
              <button class="btn btn-link btn-sm p-0 text-decoration-none" type="button" (click)="clear.emit()">Limpiar</button>
            }
          </div>
          @for (opt of options; track opt) {
            <div class="form-check">
              <input class="form-check-input" type="checkbox" [id]="uid + opt"
                     [checked]="selected.has(opt)" (change)="toggle.emit(opt)">
              <label class="form-check-label small" [for]="uid + opt">{{ opt }}</label>
            </div>
          } @empty {
            <p class="text-muted small mb-0">Sin opciones.</p>
          }
        </div>
      }
    </div>
  `
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
