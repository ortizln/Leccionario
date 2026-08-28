import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './book-search.component.html',
  styleUrl: './book-search.component.css',
    selector: 'app-book-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
