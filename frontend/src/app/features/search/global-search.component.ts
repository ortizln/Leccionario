import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface SearchResult {
  type: string;
  label: string;
  detail: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header py-2">
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input class="form-control form-control-sm" type="text" placeholder="Buscar estudiantes, cursos, docentes, facturas, libros..."
                     [(ngModel)]="query" (input)="search()" autofocus>
              <button class="btn btn-outline-secondary" type="button" (click)="close()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div class="modal-body p-0" style="max-height:400px;overflow-y:auto">
            <div *ngIf="results.length===0 && query.length>=2" class="text-center text-muted py-4">
              <i class="bi bi-search fs-1 d-block mb-2"></i>
              No se encontraron resultados para "{{ query }}"
            </div>
            <div *ngIf="results.length>0">
              <div *ngFor="let group of groupedResults">
                <div class="px-3 py-1 bg-light small fw-semibold text-muted text-uppercase">{{ group.type }}</div>
                <div class="list-group list-group-flush">
                  <button *ngFor="let r of group.items" class="list-group-item list-group-item-action py-2" (click)="navigate(r)">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi" [ngClass]="r.icon"></i>
                      <div>
                        <div class="fw-semibold small">{{ r.label }}</div>
                        <div class="text-muted" style="font-size:0.75rem">{{ r.detail }}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="query.length<2" class="text-center text-muted py-4 small">
              Escriba al menos 2 caracteres para buscar
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GlobalSearchComponent {
  @Output() closeSearch = new EventEmitter<void>();

  query = '';
  results: SearchResult[] = [];
  groupedResults: { type: string; items: SearchResult[] }[] = [];

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}
  private get instId(): number { return this.auth.institutionId() || 1; }

  search() {
    if (this.query.length < 2) {
      this.results = [];
      this.groupedResults = [];
      return;
    }
    this.http.get<SearchResult[]>(`${API_URL}/search?q=${encodeURIComponent(this.query)}&institutionId=${this.instId}`).subscribe({
      next: r => {
        this.results = r;
        const groups = new Map<string, SearchResult[]>();
        for (const item of r) {
          if (!groups.has(item.type)) groups.set(item.type, []);
          groups.get(item.type)!.push(item);
        }
        this.groupedResults = Array.from(groups.entries()).map(([type, items]) => ({ type, items }));
      },
      error: () => { this.results = []; this.groupedResults = []; }
    });
  }

  navigate(r: SearchResult) {
    this.close();
    this.router.navigateByUrl(r.route);
  }

  close() {
    this.query = '';
    this.results = [];
    this.groupedResults = [];
    this.closeSearch.emit();
  }
}
