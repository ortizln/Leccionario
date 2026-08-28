import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './campus.component.html',
  styleUrl: './campus.component.css',
    selector: 'app-campus',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CampusComponent implements OnInit {
  campus: any[] = [];
  showForm = false;
  editId: number | null = null;
  formName = ''; formCode = ''; formAddress = ''; formType = 'PRINCIPAL'; formPhone = ''; formEmail = '';
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() { this.http.get<any[]>(`${API_URL}/institution/campus/institution/${this.instId}`).subscribe({ next: d => this.campus = d }); }

  save() {
    const body: any = { institutionId: this.instId, name: this.formName, code: this.formCode, address: this.formAddress, campusType: this.formType, phone: this.formPhone, email: this.formEmail };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/campus/${this.editId}`, body) : this.http.post(`${API_URL}/institution/campus`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.formName = c.name; this.formCode = c.code; this.formAddress = c.address; this.formType = c.campusType; this.formPhone = c.phone || ''; this.formEmail = c.email || ''; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar sede?')) return; this.http.delete(`${API_URL}/institution/campus/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminada'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formCode = ''; this.formAddress = ''; this.formType = 'PRINCIPAL'; this.formPhone = ''; this.formEmail = ''; }
}
