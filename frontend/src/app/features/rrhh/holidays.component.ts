import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.css',
    selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HolidaysComponent implements OnInit {
  list: any[] = [];
  showFormModal = false;
  editId: number | null = null;
  form: any = {};

  activeCount() { return this.list.filter(h => h.active).length; }
  get upcomingCount() {
    const today = new Date().toISOString().split('T')[0];
    return this.list.filter(h => h.holidayDate >= today && h.active).length;
  }
  get nationalCount() { return this.list.filter(h => h.category === 'NACIONAL').length; }

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/holidays?institutionId=${this.instId}`).subscribe({ next: r => this.list = r, error: () => {} });
  }

  resetForm() { this.form = { name: '', holidayDate: '', category: 'NACIONAL', description: '', active: true }; this.editId = null; }

  edit(h: any) {
    this.editId = h.id;
    this.form = { name: h.name, holidayDate: h.holidayDate, category: h.category, description: h.description, active: h.active };
    this.showFormModal = true;
  }

  save() {
    const body = { ...this.form, institutionId: this.instId };
    const req = this.editId
      ? this.http.put(`${API_URL}/hr/holidays/${this.editId}`, body)
      : this.http.post(`${API_URL}/hr/holidays`, body);
    req.subscribe({ next: () => { this.showFormModal = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  deleteHoliday(id: number) {
    if (!confirm('Eliminar feriado?')) return;
    this.http.delete(`${API_URL}/hr/holidays/${id}`).subscribe({ next: () => this.load() });
  }
}
