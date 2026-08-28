import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './book-categories.component.html',
  styleUrl: './book-categories.component.css',
    selector: 'app-book-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BookCategoriesComponent implements OnInit {
  categories: any[] = [];
  showCreateModal = false;
  editMode = false;
  editId: number | null = null;
  formData: any = { name: '', description: '', parentId: null };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/library/categories?institutionId=${this.instId}`).subscribe({ next: r => this.categories = r, error: () => {} });
  }

  editCategory(c: any) { this.editMode = true; this.editId = c.id; this.formData = { ...c }; this.showCreateModal = true; }

  save() {
    const req = this.editMode
      ? this.http.put(`${API_URL}/library/categories/${this.editId}`, this.formData)
      : this.http.post(`${API_URL}/library/categories`, { ...this.formData, institutionId: this.instId });
    req.subscribe({ next: () => { this.closeModal(); this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  deleteCategory(id: number) {
    if (!confirm('Eliminar categoria?')) return;
    this.http.delete(`${API_URL}/library/categories/${id}`).subscribe({ next: () => this.load() });
  }

  closeModal() { this.showCreateModal = false; this.editMode = false; this.editId = null; this.formData = { name: '', description: '', parentId: null }; }
}
