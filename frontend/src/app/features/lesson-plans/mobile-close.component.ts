import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-mobile-close',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mobile-close.component.html',
  styleUrl: './mobile-close.component.css'
})
export class MobileCloseComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  mode: 'entry' | 'log' | 'signature' = this.route.snapshot.data['mode'];
  token = this.route.snapshot.paramMap.get('token') ?? '';
  signatureType = (this.route.snapshot.paramMap.get('signatureType') ?? '').toUpperCase();
  loading = true;
  success = false;
  message = '';
  summary: any = null;
  form = {
    username: '',
    code: '',
    notes: ''
  };

  constructor() {
    this.loadSummary();
  }

  isAlreadyClosed(): boolean {
    if (!this.summary) {
      return false;
    }
    if (this.mode === 'entry') {
      return this.summary.teacherSignatureStatus === 'SIGNED';
    }
    if (this.mode === 'signature') {
      return !!this.summary.signedAt;
    }
    return this.summary.status === 'CLOSED' || this.summary.status === 'SIGNED';
  }

  submitClose(): void {
    this.message = '';
    this.success = false;
    const endpoint = this.mode === 'entry'
      ? `${API_URL}/daily-logs/mobile/entries/${this.token}/close`
      : this.mode === 'signature'
        ? `${API_URL}/daily-logs/mobile/logs/${this.token}/signatures/${this.signatureType}`
        : `${API_URL}/daily-logs/mobile/logs/${this.token}/close`;

    this.http.post(endpoint, this.form).subscribe({
      next: (response) => {
        this.summary = response;
        this.success = true;
        this.message = this.mode === 'entry'
          ? 'La clase se cerro correctamente.'
          : this.mode === 'signature'
            ? 'La firma se registro correctamente.'
            : 'El leccionario se cerro correctamente.';
      },
      error: (error) => {
        this.success = false;
        this.message = error?.error?.message ?? 'No se pudo completar el cierre desde el movil.';
      }
    });
  }

  private loadSummary(): void {
    const endpoint = this.mode === 'entry'
      ? `${API_URL}/daily-logs/mobile/entries/${this.token}`
      : this.mode === 'signature'
        ? `${API_URL}/daily-logs/mobile/logs/${this.token}/signatures/${this.signatureType}`
        : `${API_URL}/daily-logs/mobile/logs/${this.token}`;

    this.http.get(endpoint).subscribe({
      next: (response) => {
        this.summary = response;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.message = error?.error?.message ?? 'No se pudo cargar el formulario de cierre.';
      }
    });
  }

  badgeLabel(): string {
    if (this.mode === 'entry') {
      return 'Cierre de clase';
    }
    if (this.mode === 'signature') {
      return this.signatureTypeLabel(this.signatureType);
    }
    return 'Cierre de leccionario';
  }

  titleLabel(): string {
    if (this.mode === 'entry') {
      return 'Validacion docente';
    }
    if (this.mode === 'signature') {
      return `Firma ${this.signatureTypeLabel(this.signatureType).toLowerCase()}`;
    }
    return 'Validacion de inspector';
  }

  descriptionLabel(): string {
    if (this.mode === 'entry') {
      return 'Escanea el QR de la hora clase, confirma tu usuario y codigo institucional para cerrar la clase.';
    }
    if (this.mode === 'signature') {
      return 'Escanea el QR de firma, confirma tu usuario y codigo institucional para registrar esta firma del leccionario.';
    }
    return 'Escanea el QR del leccionario y confirma tu usuario y codigo institucional para cerrar la jornada.';
  }

  notesLabel(): string {
    if (this.mode === 'entry') {
      return 'Observacion opcional';
    }
    if (this.mode === 'signature') {
      return 'Observacion de firma';
    }
    return 'Observacion de cierre';
  }

  actionLabel(): string {
    if (this.mode === 'entry') {
      return 'Cerrar clase';
    }
    if (this.mode === 'signature') {
      return `Firmar como ${this.signatureTypeLabel(this.signatureType).toLowerCase()}`;
    }
    return 'Cerrar leccionario';
  }

  alreadyClosedLabel(): string {
    if (this.mode === 'entry') {
      return 'La clase ya fue cerrada por el docente.';
    }
    if (this.mode === 'signature') {
      return 'Esta firma ya fue registrada.';
    }
    return 'El leccionario ya fue cerrado por inspeccion.';
  }

  signatureTypeLabel(signatureType: string): string {
    switch (signatureType) {
      case 'TEACHER_TUTOR':
        return 'Docente tutor';
      case 'WEEK_STUDENT':
        return 'Semanero';
      case 'GENERAL_INSPECTOR':
        return 'Inspector general';
      default:
        return 'Firma';
    }
  }
}
