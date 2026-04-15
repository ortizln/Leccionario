import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionItem, RoleItem, UserItem, UserSavePayload } from './users.models';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() roles: RoleItem[] = [];
  @Input() institutions: InstitutionItem[] = [];
  @Input() user: UserItem | null = null;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() save = new EventEmitter<UserSavePayload>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = '';
  selectedRoleNames = new Set<string>();

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    identification: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    institutionId: [0, Validators.required],
    enabled: [true]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] || changes['institutions']) {
      this.syncForm();
    }
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').toLowerCase().replace(/^\w/, char => char.toUpperCase());
  }

  toggleRole(roleName: string, checked: boolean): void {
    if (checked) {
      this.selectedRoleNames.add(roleName);
    } else {
      this.selectedRoleNames.delete(roleName);
    }
  }

  selectedSubjectText(): string {
    return this.user?.specialization || 'No asignada';
  }

  submit(): void {
    this.errorMessage = '';
    if (this.form.invalid || this.selectedRoleNames.size === 0) {
      this.errorMessage = 'Completa los campos obligatorios y asigna al menos un perfil.';
      return;
    }

    this.save.emit({
      ...this.form.getRawValue(),
      roles: Array.from(this.selectedRoleNames)
    });
  }

  private syncForm(): void {
    if (this.user) {
      this.selectedRoleNames = new Set(this.user.roles);
      this.form.setValue({
        username: this.user.username,
        email: this.user.email,
        password: '',
        identification: this.user.identification,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        institutionId: this.user.institutionId,
        enabled: this.user.enabled
      });
      return;
    }

    this.selectedRoleNames = new Set();
    this.form.reset({
      username: '',
      email: '',
      password: '',
      identification: '',
      firstName: '',
      lastName: '',
      institutionId: this.institutions[0]?.id ?? 0,
      enabled: true
    });
  }
}
