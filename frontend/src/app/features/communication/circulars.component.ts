import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './circulars.component.html',
  styleUrl: './circulars.component.css',
    selector: 'app-circulars',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CircularsComponent implements OnInit {
  circulars: any[] = [];
  showCreateModal = false;
  form: any = { title: '', content: '', category: 'GENERAL', publishDate: new Date().toISOString().split('T')[0] };
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  load() { this.http.get<any[]>(`${API_URL}/communication/circulars?institutionId=${this.instId}`).subscribe({ next: r => this.circulars = r, error: () => {} }); }
  save() {
    this.http.post<any>(`${API_URL}/communication/circulars`, { ...this.form, institutionId: this.instId, authorUserId: 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { title: '', content: '', category: 'GENERAL', publishDate: new Date().toISOString().split('T')[0] }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  deleteCircular(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/communication/circulars/${id}`).subscribe({ next: () => this.load() }); }
}
