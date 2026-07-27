import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-book-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-search me-2"></i>Busqueda de Libros</h5>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-8">
            <input class="form-control form-control-sm" [(ngModel)]="searchTerm" placeholder="Buscar por titulo o autor..." (keyup.enter)="search()">
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="searchType">
              <option value="title">Titulo</option>
              <option value="author">Autor</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-sm btn-primary w-100" (click)="search()">Buscar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-4" *ngFor="let b of results">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h6 class="card-title">{{ b.title }}</h6>
            <p class="text-muted small mb-1">{{ b.author }}</p>
            <p class="text-muted small mb-1">{{ b.publisher }} ({{ b.publicationYear }})</p>
            <p class="text-muted small mb-2">ISBN: {{ b.isbn }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge" [class.bg-success]="b.availableCopies>0" [class.bg-danger]="b.availableCopies===0">
                {{ b.availableCopies }}/{{ b.totalCopies }} disponibles
              </span>
              <span class="badge bg-secondary">{{ b.language }}</span>
            </div>
            <p class="small text-muted mt-2 mb-0" *ngIf="b.location"><i class="bi bi-geo-alt me-1"></i>{{ b.location }}</p>
          </div>
        </div>
      </div>
      <div class="col-12" *ngIf="results.length===0 && searched">
        <div class="text-center text-muted py-5">
          <i class="bi bi-search fs-1"></i>
          <p class="mt-2">No se encontraron libros</p>
        </div>
      </div>
    </div>
  `
})
export class BookSearchComponent implements OnInit {
  searchTerm = '';
  searchType = 'title';
  results: any[] = [];
  searched = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.loadAll(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  loadAll() {
    this.http.get<any[]>(`${API_URL}/library/books?institutionId=${this.instId}`).subscribe({ next: r => this.results = r, error: () => {} });
  }

  search() {
    this.searched = true;
    if (!this.searchTerm.trim()) { this.loadAll(); return; }
    this.http.get<any[]>(`${API_URL}/library/books?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.results = r.filter(b => {
          const term = this.searchTerm.toLowerCase();
          return this.searchType === 'title' ? b.title.toLowerCase().includes(term) : (b.author || '').toLowerCase().includes(term);
        });
      },
      error: () => {}
    });
  }
}
