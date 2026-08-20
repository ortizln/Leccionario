import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_URL } from '../../core/api.config';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let httpMock: HttpTestingController;

  const mockUsers = [
    { id: 1, username: 'admin', firstName: 'Admin', lastName: 'User', roles: ['ROLE_ADMINISTRADOR'], enabled: true, institutionName: 'Inst', specialization: null },
    { id: 2, username: 'teacher1', firstName: 'Teacher', lastName: 'One', roles: ['ROLE_DOCENTE'], enabled: true, institutionName: 'Inst', specialization: 'Matematicas' },
    { id: 3, username: 'student1', firstName: 'Student', lastName: 'One', roles: ['ROLE_ESTUDIANTE'], enabled: false, institutionName: 'Inst', specialization: null },
  ];

  const mockRoles = [
    { name: 'ROLE_ADMINISTRADOR', description: 'Admin', permissions: ['USER_MANAGE'] },
    { name: 'ROLE_DOCENTE', description: 'Docente', permissions: ['ACADEMIC_VIEW'] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users, roles, and institutions on init', () => {
    const req1 = httpMock.expectOne(`${API_URL}/users`);
    req1.flush(mockUsers);

    const req2 = httpMock.expectOne(`${API_URL}/roles`);
    req2.flush(mockRoles);

    const req3 = httpMock.expectOne(`${API_URL}/users/institutions`);
    req3.flush([]);

    expect(component.users.length).toBe(3);
    expect(component.roles.length).toBe(2);
    expect(component.selectedRoleName).toBe('ROLE_ADMINISTRADOR');
  });

  it('filteredUsers should filter by search term', () => {
    const req1 = httpMock.expectOne(`${API_URL}/users`);
    req1.flush(mockUsers);
    httpMock.expectOne(`${API_URL}/roles`).flush(mockRoles);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    component.userSearch = 'admin';
    const filtered = component.filteredUsers;
    expect(filtered.length).toBe(1);
    expect(filtered[0].username).toBe('admin');
  });

  it('filteredUsers should filter by role', () => {
    const req1 = httpMock.expectOne(`${API_URL}/users`);
    req1.flush(mockUsers);
    httpMock.expectOne(`${API_URL}/roles`).flush(mockRoles);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    component.roleFilter = 'ROLE_DOCENTE';
    const filtered = component.filteredUsers;
    expect(filtered.length).toBe(1);
    expect(filtered[0].username).toBe('teacher1');
  });

  it('filteredUsers should filter by status', () => {
    const req1 = httpMock.expectOne(`${API_URL}/users`);
    req1.flush(mockUsers);
    httpMock.expectOne(`${API_URL}/roles`).flush(mockRoles);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    component.statusFilter = 'INACTIVE';
    const filtered = component.filteredUsers;
    expect(filtered.length).toBe(1);
    expect(filtered[0].username).toBe('student1');
  });

  it('formatRole should strip ROLE_ prefix and capitalize', () => {
    httpMock.expectOne(`${API_URL}/users`).flush([]);
    httpMock.expectOne(`${API_URL}/roles`).flush([]);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    expect(component.formatRole('ROLE_ADMINISTRADOR')).toBe('Administrador');
    expect(component.formatRole('ROLE_DOCENTE')).toBe('Docente');
  });

  it('permissionLabel should format permission strings', () => {
    httpMock.expectOne(`${API_URL}/users`).flush([]);
    httpMock.expectOne(`${API_URL}/roles`).flush([]);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    expect(component.permissionLabel('USER_MANAGE')).toBe('User Manage');
    expect(component.permissionLabel('ACADEMIC_VIEW')).toBe('Academic View');
  });

  it('should start in list view', () => {
    httpMock.expectOne(`${API_URL}/users`).flush([]);
    httpMock.expectOne(`${API_URL}/roles`).flush([]);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    expect(component.usersMode).toBe('list');
    expect(component.editingUser).toBeNull();
  });

  it('openCreateUser should switch to form view', () => {
    httpMock.expectOne(`${API_URL}/users`).flush([]);
    httpMock.expectOne(`${API_URL}/roles`).flush([]);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    component.openCreateUser();
    expect(component.usersMode).toBe('form');
    expect(component.editingUser).toBeNull();
  });

  it('closeUserForm should switch back to list view', () => {
    httpMock.expectOne(`${API_URL}/users`).flush([]);
    httpMock.expectOne(`${API_URL}/roles`).flush([]);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    component.openCreateUser();
    component.closeUserForm();
    expect(component.usersMode).toBe('list');
  });

  it('subjectOptions should return unique specializations', () => {
    const req1 = httpMock.expectOne(`${API_URL}/users`);
    req1.flush(mockUsers);
    httpMock.expectOne(`${API_URL}/roles`).flush(mockRoles);
    httpMock.expectOne(`${API_URL}/users/institutions`).flush([]);

    expect(component.subjectOptions).toEqual(['Matematicas']);
  });
});
