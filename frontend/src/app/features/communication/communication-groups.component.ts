import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './communication-groups.component.html',
  styleUrl: './communication-groups.component.css',
    selector: 'app-communication-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CommunicationGroupsComponent implements OnInit {
  groups: any[] = [];
  showForm = false;
  showBulkForm = false;
  editMode = false;
  form = { name: '', type: 'CUSTOM', description: '' };
  bulkForm = { subject: '', message: '', sendNotification: true };
  selectedGroup: any = null;
  editId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/groups?institutionId=${this.instId}`).subscribe({
      next: r => this.groups = r,
      error: () => {}
    });
  }

  openForm() {
    this.editMode = false;
    this.form = { name: '', type: 'CUSTOM', description: '' };
    this.showForm = true;
  }

  editGroup(g: any) {
    this.editMode = true;
    this.editId = g.id;
    this.form = { name: g.name, type: g.type, description: g.description || '' };
    this.showForm = true;
  }

  save() {
    if (!this.form.name) { alert('Ingrese el nombre del grupo'); return; }
    const body = { ...this.form, institutionId: this.instId };
    if (this.editMode && this.editId) {
      this.http.put(`${API_URL}/communication/groups/${this.editId}`, body).subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
    } else {
      this.http.post(`${API_URL}/communication/groups?institutionId=${this.instId}`, body).subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
    }
  }

  sendBulk(g: any) {
    this.selectedGroup = g;
    this.bulkForm = { subject: '', message: '', sendNotification: true };
    this.showBulkForm = true;
  }

  sendBulkMessage() {
    if (!this.bulkForm.subject || !this.bulkForm.message) { alert('Complete asunto y mensaje'); return; }
    this.http.post(`${API_URL}/communication/groups/${this.selectedGroup.id}/send`, {
      subject: this.bulkForm.subject,
      message: this.bulkForm.message,
      sendNotification: this.bulkForm.sendNotification
    }).subscribe({ next: () => { this.showBulkForm = false; alert('Mensaje enviado'); }, error: e => alert(e.error?.message || 'Error') });
  }

  deleteGroup(g: any) {
    if (!confirm(`Eliminar grupo "${g.name}"?`)) return;
    this.http.delete(`${API_URL}/communication/groups/${g.id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message || 'Error') });
  }
}
