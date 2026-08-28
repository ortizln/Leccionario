import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css',
    selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ShiftsComponent implements OnInit {
  shifts: any[] = [];
  showForm = false;
  editId: number | null = null;
  formName = ''; formCode = ''; formStart = '07:00'; formEnd = '12:30'; formType = 'REGULAR';
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() { this.http.get<any[]>(`${API_URL}/institution/shifts/institution/${this.instId}`).subscribe({ next: d => this.shifts = d }); }

  save() {
    const body: any = { institutionId: this.instId, name: this.formName, code: this.formCode, startTime: this.formStart, endTime: this.formEnd, shiftType: this.formType };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/shifts/${this.editId}`, body) : this.http.post(`${API_URL}/institution/shifts`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(s: any) { this.editId = s.id; this.formName = s.name; this.formCode = s.code; this.formStart = s.startTime; this.formEnd = s.endTime; this.formType = s.shiftType; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar jornada?')) return; this.http.delete(`${API_URL}/institution/shifts/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminada'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formCode = ''; this.formStart = '07:00'; this.formEnd = '12:30'; this.formType = 'REGULAR'; }
}
