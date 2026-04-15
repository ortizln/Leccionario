import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AddUserComponent } from './add-user.component';
import { InstitutionItem, RoleItem, UserItem, UserSavePayload } from './users.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, AddUserComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  users: UserItem[] = [];
  roles: RoleItem[] = [];
  institutions: InstitutionItem[] = [];
  activeView: 'users' | 'roles' = 'users';
  usersMode: 'list' | 'form' = 'list';
  editingUser: UserItem | null = null;
  selectedRoleName: string | null = null;
  selectedPermissions = new Set<string>();
  userSearch = '';
  roleFilter = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  subjectFilter = '';
  showFilters = true;
  statusDialogUser: UserItem | null = null;
  passwordDialogUser: UserItem | null = null;
  roleDialogOpen = false;
  passwordResetValue = 'Temp123*';
  errorMessage = '';

  readonly permissionGroups = [
    { module: 'Usuarios', permissions: ['USER_VIEW', 'USER_MANAGE', 'ROLE_VIEW', 'ROLE_MANAGE'] },
    { module: 'Academico', permissions: ['ACADEMIC_VIEW', 'ACADEMIC_MANAGE'] },
    { module: 'Leccionario', permissions: ['LESSONPLAN_VIEW', 'LESSONPLAN_MANAGE'] },
    { module: 'Reportes', permissions: ['REPORT_VIEW', 'REPORT_EXPORT'] },
    { module: 'Auditoria', permissions: ['AUDIT_VIEW'] }
  ];

  roleForm = this.fb.nonNullable.group({
    description: ['', Validators.required]
  });

  roleCreateForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });

  constructor() {
    this.loadData();
  }

  get selectedRole(): RoleItem | undefined {
    return this.roles.find(role => role.name === this.selectedRoleName);
  }

  get subjectOptions(): string[] {
    return Array.from(new Set(
      this.users
        .map(user => user.specialization?.trim())
        .filter((value): value is string => !!value)
    )).sort((a, b) => a.localeCompare(b));
  }

  get filteredUsers(): UserItem[] {
    const search = this.userSearch.trim().toLowerCase();
    return this.users.filter(user => {
      const matchesSearch = !search
        || user.username.toLowerCase().includes(search)
        || `${user.firstName} ${user.lastName}`.toLowerCase().includes(search);
      const matchesRole = !this.roleFilter || user.roles.includes(this.roleFilter);
      const matchesStatus = this.statusFilter === 'ALL'
        || (this.statusFilter === 'ACTIVE' && user.enabled)
        || (this.statusFilter === 'INACTIVE' && !user.enabled);
      const specialization = user.specialization?.trim() ?? '';
      const matchesSubject = !this.subjectFilter
        || (this.subjectFilter === '__NONE__' && !specialization)
        || specialization === this.subjectFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesSubject;
    });
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').toLowerCase().replace(/^\w/, char => char.toUpperCase());
  }

  permissionLabel(permission: string): string {
    return permission
      .toLowerCase()
      .split('_')
      .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  openCreateUser(): void {
    this.errorMessage = '';
    this.editingUser = null;
    this.usersMode = 'form';
  }

  openEditUser(user: UserItem): void {
    this.errorMessage = '';
    this.editingUser = user;
    this.usersMode = 'form';
  }

  closeUserForm(): void {
    this.editingUser = null;
    this.usersMode = 'list';
  }

  printUsers(): void {
    window.print();
  }

  downloadUserTemplate(): void {
    this.http.get(`${API_URL}/users/import-template`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'usuarios-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar la plantilla de usuarios.'
    });
  }

  triggerUserImport(): void {
    document.getElementById('users-import-input')?.click();
  }

  handleUserImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    this.http.post<ImportSummaryResult>(`${API_URL}/users/import`, formData).subscribe({
      next: (response) => {
        this.errorMessage = this.formatImportSummary(response, 'usuarios');
        this.loadUsers();
        input.value = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo importar el archivo de usuarios.';
        input.value = '';
      }
    });
  }

  exportUsersCsv(): void {
    const headers = ['Usuario', 'Nombres', 'Apellidos', 'Perfiles', 'Materia', 'Institucion', 'Estado'];
    const rows = this.filteredUsers.map(user => [
      user.username,
      user.firstName,
      user.lastName,
      user.roles.map(role => this.formatRole(role)).join(' | '),
      user.specialization || '',
      user.institutionName,
      user.enabled ? 'Activo' : 'Inactivo'
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios-leccionario.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  exportUsersExcel(): void {
    const rows = this.filteredUsers.map(user => `
      <tr>
        <td>${this.escapeHtml(user.username)}</td>
        <td>${this.escapeHtml(user.firstName)}</td>
        <td>${this.escapeHtml(user.lastName)}</td>
        <td>${this.escapeHtml(user.roles.map(role => this.formatRole(role)).join(', '))}</td>
        <td>${this.escapeHtml(user.specialization || '')}</td>
        <td>${this.escapeHtml(user.institutionName)}</td>
        <td>${user.enabled ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('');

    const html = `
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Perfiles</th>
            <th>Materia</th>
            <th>Institucion</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios-leccionario.xls';
    link.click();
    URL.revokeObjectURL(url);
  }

  exportUsersPdf(): void {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      this.errorMessage = 'No se pudo abrir la ventana de impresion para exportar PDF.';
      return;
    }

    const rows = this.filteredUsers.map(user => `
      <tr>
        <td>${this.escapeHtml(user.username)}</td>
        <td>${this.escapeHtml(`${user.firstName} ${user.lastName}`)}</td>
        <td>${this.escapeHtml(user.roles.map(role => this.formatRole(role)).join(', '))}</td>
        <td>${this.escapeHtml(user.specialization || 'Sin materia')}</td>
        <td>${this.escapeHtml(user.institutionName)}</td>
        <td>${user.enabled ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Usuarios Leccionario</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 6px; }
            p { color: #555; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f2c230; }
          </style>
        </head>
        <body>
          <h1>Listado de usuarios</h1>
          <p>Leccionario Estudiantil Digital</p>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Perfiles</th>
                <th>Materia</th>
                <th>Institucion</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  openStatusDialog(user: UserItem): void {
    this.statusDialogUser = user;
  }

  closeStatusDialog(): void {
    this.statusDialogUser = null;
  }

  confirmStatusToggle(): void {
    if (!this.statusDialogUser) {
      return;
    }

    const enabled = !this.statusDialogUser.enabled;
    this.http.patch<UserItem>(`${API_URL}/users/${this.statusDialogUser.id}/status`, { enabled }).subscribe({
      next: () => {
        this.closeStatusDialog();
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo actualizar el estado del usuario.';
      }
    });
  }

  openPasswordDialog(user: UserItem): void {
    this.passwordDialogUser = user;
    this.passwordResetValue = 'Temp123*';
  }

  closePasswordDialog(): void {
    this.passwordDialogUser = null;
    this.passwordResetValue = 'Temp123*';
  }

  confirmPasswordReset(): void {
    if (!this.passwordDialogUser || !this.passwordResetValue.trim()) {
      this.errorMessage = 'Ingresa una contrasena valida para continuar.';
      return;
    }

    this.http.post<UserItem>(`${API_URL}/users/${this.passwordDialogUser.id}/reset-password`, {
      password: this.passwordResetValue.trim()
    }).subscribe({
      next: () => {
        this.errorMessage = `Contrasena restablecida correctamente para ${this.passwordDialogUser?.username}.`;
        this.closePasswordDialog();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo restablecer la contrasena.';
      }
    });
  }

  openRoleDialog(): void {
    this.errorMessage = '';
    this.roleDialogOpen = true;
    this.roleCreateForm.reset({
      name: '',
      description: ''
    });
  }

  closeRoleDialog(): void {
    this.roleDialogOpen = false;
  }

  createRole(): void {
    this.errorMessage = '';
    if (this.roleCreateForm.invalid) {
      this.errorMessage = 'Completa el nombre y la descripcion del nuevo perfil.';
      return;
    }

    this.http.post<RoleItem>(`${API_URL}/roles`, {
      name: this.roleCreateForm.getRawValue().name.trim(),
      description: this.roleCreateForm.getRawValue().description.trim(),
      permissions: []
    }).subscribe({
      next: (role) => {
        this.closeRoleDialog();
        this.loadRoles(() => this.selectRole(role.name));
      },
      error: (error) => {
        this.errorMessage = this.extractApiError(error, 'No se pudo crear el perfil.');
      }
    });
  }

  deleteRole(role: RoleItem): void {
    const confirmed = window.confirm(`Se eliminara el perfil ${this.formatRole(role.name)}. Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.http.delete(`${API_URL}/roles/${role.name}`).subscribe({
      next: () => {
        this.loadRoles(() => {
          const nextRole = this.roles[0];
          this.selectedRoleName = null;
          if (nextRole) {
            this.selectRole(nextRole.name);
          }
        });
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo eliminar el perfil.';
      }
    });
  }

  toggleRolePermission(permission: string, checked: boolean): void {
    if (checked) {
      this.selectedPermissions.add(permission);
    } else {
      this.selectedPermissions.delete(permission);
    }
  }

  selectRole(roleName: string): void {
    this.selectedRoleName = roleName;
    const role = this.roles.find(item => item.name === roleName);
    this.roleForm.patchValue({ description: role?.description ?? '' });
    this.selectedPermissions = new Set(role?.permissions ?? []);
  }

  saveUser(payload: UserSavePayload): void {
    this.errorMessage = '';
    const request$ = this.editingUser
      ? this.http.put<UserItem>(`${API_URL}/users/${this.editingUser.id}`, payload)
      : this.http.post<UserItem>(`${API_URL}/users`, payload);

    request$.subscribe({
      next: () => {
        this.loadUsers(() => this.closeUserForm());
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar el usuario.';
      }
    });
  }

  saveRole(): void {
    this.errorMessage = '';
    if (!this.selectedRoleName || this.roleForm.invalid) {
      this.errorMessage = 'Selecciona un perfil y completa su descripcion.';
      return;
    }

    this.http.put<RoleItem>(`${API_URL}/roles/${this.selectedRoleName}`, {
      description: this.roleForm.getRawValue().description,
      permissions: Array.from(this.selectedPermissions)
    }).subscribe({
      next: () => {
        this.loadRoles(() => this.selectRole(this.selectedRoleName!));
      },
      error: (error) => {
        this.errorMessage = this.extractApiError(error, 'No se pudo guardar el perfil.');
      }
    });
  }

  private extractApiError(error: unknown, fallback: string): string {
    const apiError = error as { error?: { message?: string; errors?: Record<string, string> } };
    if (apiError?.error?.message) {
      return apiError.error.message;
    }

    const fieldErrors = apiError?.error?.errors;
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      return Object.entries(fieldErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(' | ');
    }

    return fallback;
  }

  private loadData(): void {
    forkJoin({
      users: this.http.get<UserItem[]>(`${API_URL}/users`),
      roles: this.http.get<RoleItem[]>(`${API_URL}/roles`),
      institutions: this.http.get<InstitutionItem[]>(`${API_URL}/users/institutions`)
    }).subscribe({
      next: ({ users, roles, institutions }) => {
        this.users = users;
        this.roles = roles;
        this.institutions = institutions;
        if (!this.selectedRoleName && roles.length > 0) {
          this.selectRole(roles[0].name);
        }
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la configuracion de usuarios y perfiles.';
      }
    });
  }

  private loadUsers(afterLoad?: () => void): void {
    this.http.get<UserItem[]>(`${API_URL}/users`).subscribe({
      next: (users) => {
        this.users = users;
        afterLoad?.();
      },
      error: () => this.errorMessage = 'No se pudo recargar el listado de usuarios.'
    });
  }

  private loadRoles(afterLoad?: () => void): void {
    this.http.get<RoleItem[]>(`${API_URL}/roles`).subscribe({
      next: (roles) => {
        this.roles = roles;
        afterLoad?.();
      },
      error: () => this.errorMessage = 'No se pudo recargar la configuracion de perfiles.'
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private formatImportSummary(summary: ImportSummaryResult, entity: string): string {
    const lines = [
      `${summary.message} Procesadas: ${summary.total}. Importadas: ${summary.imported}. Fallidas: ${summary.failed}.`
    ];
    if (summary.errors.length > 0) {
      lines.push(`Detalle ${entity}: ${summary.errors.slice(0, 5).join(' | ')}`);
      if (summary.errors.length > 5) {
        lines.push(`Se omitieron ${summary.errors.length - 5} errores adicionales.`);
      }
    }
    return lines.join(' ');
  }
}

type ImportSummaryResult = {
  module: string;
  total: number;
  imported: number;
  failed: number;
  message: string;
  errors: string[];
};
