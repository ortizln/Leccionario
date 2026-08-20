import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';
import { BrandingService } from '../../core/branding.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let brandingServiceSpy: jasmine.SpyObj<BrandingService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'defaultRoute']);
    brandingServiceSpy = jasmine.createSpyObj('BrandingService', [
      'loadPublicInstitutions', 'loadPublicBranding', 'setSelectedInstitutionCode',
      'selectedInstitutionCode', 'syncAuthenticatedBranding', 'publicInstitutions', 'branding'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    brandingServiceSpy.loadPublicInstitutions.and.returnValue(of([]));
    brandingServiceSpy.loadPublicBranding.and.returnValue(of(null));
    brandingServiceSpy.publicInstitutions.and.returnValue([]);
    brandingServiceSpy.selectedInstitutionCode.and.returnValue(null);
    brandingServiceSpy.branding.and.returnValue(null);
    brandingServiceSpy.syncAuthenticatedBranding.and.stub();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BrandingService, useValue: brandingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty form initially', () => {
    expect(component.form.get('username')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('form should be valid when filled', () => {
    component.form.patchValue({ username: 'admin', password: 'Admin123*' });
    expect(component.form.valid).toBe(true);
  });

  it('should not call login when form is invalid', () => {
    component.submit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login and navigate on success', fakeAsync(() => {
    const mockSession = {
      token: 'test-token',
      username: 'admin',
      fullName: 'Admin',
      primaryRole: 'Administrador',
      roles: ['ROLE_ADMINISTRADOR'],
      permissions: ['USER_MANAGE']
    };
    authServiceSpy.login.and.returnValue(of(mockSession as any));
    authServiceSpy.defaultRoute.and.returnValue('/app/users');

    component.form.patchValue({ username: 'admin', password: 'Admin123*' });
    component.submit();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/app/users');
  }));

  it('should show error on login failure', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Unauthorized')));

    component.form.patchValue({ username: 'admin', password: 'wrong' });
    component.submit();
    tick();

    expect(component.loginError).toBeTruthy();
  }));

  it('togglePassword should toggle showPassword', () => {
    expect(component.showPassword).toBe(false);
    component.togglePassword();
    expect(component.showPassword).toBe(true);
    component.togglePassword();
    expect(component.showPassword).toBe(false);
  });

  it('absenceLabel should return correct labels', () => {
    expect(component.branding().loginTitle).toBeTruthy();
  });
});
