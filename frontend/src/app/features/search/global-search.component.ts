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
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.css',
    selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
