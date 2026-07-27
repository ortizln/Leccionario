import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated() should return false when no session', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('token() should return null when no session', () => {
    expect(service.token()).toBeNull();
  });

  it('roles() should return empty array when no session', () => {
    expect(service.roles()).toEqual([]);
  });

  it('permissions() should return empty array when no session', () => {
    expect(service.permissions()).toEqual([]);
  });

  it('isAdmin() should return false when no session', () => {
    expect(service.isAdmin()).toBe(false);
  });

  it('should store and retrieve session from localStorage', () => {
    const mockSession = {
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInN1YiI6ImFkbWluIn0.test',
      username: 'admin',
      fullName: 'Admin User',
      primaryRole: 'Administrador',
      specialization: null,
      institutionId: 1,
      institutionCode: 'INST01',
      institutionName: 'Test School',
      roles: ['ROLE_ADMINISTRADOR'],
      permissions: ['USER_MANAGE', 'ACADEMIC_VIEW']
    };
    localStorage.setItem('auth_session', JSON.stringify(mockSession));

    expect(service.isAuthenticated()).toBe(true);
    expect(service.username()).toBe('admin');
    expect(service.fullName()).toBe('Admin User');
    expect(service.primaryRole()).toBe('Administrador');
    expect(service.institutionId()).toBe(1);
    expect(service.isAdmin()).toBe(true);
    expect(service.hasPermission('USER_MANAGE')).toBe(true);
    expect(service.hasPermission('NONEXISTENT')).toBe(true);
  });

  it('logout() should clear session', () => {
    const mockSession = {
      token: 'test-token',
      username: 'admin',
      fullName: 'Admin',
      primaryRole: 'Administrador',
      specialization: null,
      institutionId: 1,
      institutionCode: 'INST01',
      institutionName: 'Test',
      roles: ['ROLE_ADMINISTRADOR'],
      permissions: []
    };
    localStorage.setItem('auth_session', JSON.stringify(mockSession));
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('defaultRoute() should return correct route based on permissions', () => {
    const mockSession = {
      token: 'test-token',
      username: 'admin',
      fullName: 'Admin',
      primaryRole: 'Administrador',
      specialization: null,
      institutionId: 1,
      institutionCode: 'INST01',
      institutionName: 'Test',
      roles: ['ROLE_ADMINISTRADOR'],
      permissions: ['USER_MANAGE']
    };
    localStorage.setItem('auth_session', JSON.stringify(mockSession));

    expect(service.defaultRoute()).toBe('/app/users');
  });
});
