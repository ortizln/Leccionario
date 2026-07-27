import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../core/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.7); z-index: 9999;
      display: flex; align-items: center; justify-content: center;
    }
  `]
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
