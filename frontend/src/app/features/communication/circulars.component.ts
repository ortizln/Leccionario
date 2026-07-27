import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-circulars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-megaphone me-2"></i>Circulares Oficiales</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nueva Circular</button>
    </div>
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Titulo</th><th>Categoria</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let c of circulars">
                <td class="fw-semibold">{{ c.title }}</td>
                <td><span class="badge bg-info">{{ c.category || 'GENERAL' }}</span></td>
                <td>{{ c.publishDate }}</td>
                <td><span class="badge" [class.bg-success]="c.status==='PUBLICADA'" [class.bg-secondary]="c.status==='BORRADOR'" [class.bg-dark]="c.status==='ARCHIVADA'">{{ c.status }}</span></td>
                <td><button class="btn btn-sm btn-outline-danger" (click)="deleteCircular(c.id)"><i class="bi bi-trash"></i></button></td>
              </tr>
              <tr *ngIf="circulars.length===0"><td colspan="5" class="text-center text-muted py-3">No hay circulares</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header py-2"><h6 class="modal-title">Nueva Circular</h6></div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-12"><label class="form-label small">Titulo *</label><input class="form-control form-control-sm" [(ngModel)]="form.title"></div>
            <div class="col-md-6"><label class="form-label small">Categoria</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.category"><option value="ACADEMICA">Academica</option><option value="ADMINISTRATIVA">Administrativa</option><option value="DISCIPLINARIA">Disciplinaria</option><option value="GENERAL">General</option></select>
            </div>
            <div class="col-md-6"><label class="form-label small">Fecha Publicacion</label><input type="date" class="form-control form-control-sm" [(ngModel)]="form.publishDate"></div>
            <div class="col-12"><label class="form-label small">Contenido *</label><textarea class="form-control form-control-sm" [(ngModel)]="form.content" rows="5"></textarea></div>
          </div>
        </div>
        <div class="modal-footer py-2">
          <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
          <button class="btn btn-sm btn-primary" (click)="save()" [disabled]="!form.title || !form.content">Crear</button>
        </div>
      </div></div>
    </div>
  `
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
