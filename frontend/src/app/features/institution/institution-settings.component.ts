import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './institution-settings.component.html',
  styleUrl: './institution-settings.component.css',
    selector: 'app-institution-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class InstitutionSettingsComponent implements OnInit {
  tab = 'general';
  settings: any[] = [];
  editId: number | null = null;
  formKey = ''; formValue = ''; formType = 'STRING'; formCategory = 'GENERAL'; formDescription = '';
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.loadGeneral(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadGeneral() { this.loadByCategory('GENERAL'); }
  loadAcademic() { this.loadByCategory('ACADEMICO'); }
  loadNotifications() { this.loadByCategory('NOTIFICACIONES'); }

  loadByCategory(cat: string) {
    this.http.get<any[]>(`${API_URL}/institution/settings/institution/${this.instId}/category/${cat}`)
      .subscribe({ next: d => this.settings = d, error: () => this.settings = [] });
  }

  save() {
    const body: any = { institutionId: this.instId, settingKey: this.formKey, settingValue: this.formValue, settingType: this.formType, category: this.formCategory, description: this.formDescription };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/settings/${this.editId}`, body) : this.http.post(`${API_URL}/institution/settings`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'general'; this.loadGeneral(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(s: any) { this.editId = s.id; this.formKey = s.settingKey; this.formValue = s.settingValue || ''; this.formType = s.settingType; this.formCategory = s.category || ''; this.formDescription = s.description || ''; this.tab = 'new'; }

  delete(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/institution/settings/${id}`).subscribe({ next: () => { this.loadGeneral(); this.showMsg('Eliminado'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formKey = ''; this.formValue = ''; this.formType = 'STRING'; this.formCategory = 'GENERAL'; this.formDescription = ''; }
}
