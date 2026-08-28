import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './school-calendar.component.html',
  styleUrl: './school-calendar.component.css',
    selector: 'app-school-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SchoolCalendarComponent implements OnInit {
  events: any[] = [];
  showForm = false;
  editId: number | null = null;
  formName = ''; formType = 'INSTITUCIONAL'; formStart = ''; formEnd = ''; formDescription = ''; formColor = '#3B4436';
  filterMonth = ''; filterType = '';
  message = ''; isError = false;
  instId = 1;

  months = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() {
    const doFilter = (data: any[]) => {
      let filtered = data;
      if (this.filterMonth) {
        filtered = filtered.filter(e => {
          const startMonth = e.startDate ? e.startDate.substring(5, 7) : '';
          const endMonth = e.endDate ? e.endDate.substring(5, 7) : '';
          return startMonth === this.filterMonth || endMonth === this.filterMonth;
        });
      }
      this.events = filtered;
    };
    if (this.filterType) {
      this.http.get<any[]>(`${API_URL}/institution/calendar/institution/${this.instId}/type/${this.filterType}`).subscribe({ next: doFilter });
    } else {
      this.http.get<any[]>(`${API_URL}/institution/calendar/institution/${this.instId}`).subscribe({ next: doFilter });
    }
  }

  save() {
    const body: any = { institutionId: this.instId, eventName: this.formName, eventType: this.formType, startDate: this.formStart, endDate: this.formEnd, description: this.formDescription, color: this.formColor };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/calendar/${this.editId}`, body) : this.http.post(`${API_URL}/institution/calendar`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(e: any) { this.editId = e.id; this.formName = e.eventName; this.formType = e.eventType; this.formStart = e.startDate; this.formEnd = e.endDate; this.formDescription = e.description || ''; this.formColor = e.color || '#3B4436'; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar evento?')) return; this.http.delete(`${API_URL}/institution/calendar/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminado'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formType = 'INSTITUCIONAL'; this.formStart = ''; this.formEnd = ''; this.formDescription = ''; this.formColor = '#3B4436'; }

  typeLabel(t: string): string { const m: Record<string, string> = { INSTITUCIONAL: 'Institucional', ACADEMICO: 'Academico', FERIADO: 'Feriado', VACACIONES: 'Vacaciones', EVALUACION: 'Evaluacion', EXCURSION: 'Excursion', CAPACITACION: 'Capacitacion', OTRO: 'Otro' }; return m[t] || t; }
}
