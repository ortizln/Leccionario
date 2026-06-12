import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrandingService, InstitutionBranding } from './branding.service';
import { AuthService } from './auth.service';
import { API_URL } from './api.config';

describe('BrandingService', () => {
  let service: BrandingService;
  let httpMock: HttpTestingController;
  const mockBranding: InstitutionBranding = {
    institutionId: 1,
    institutionCode: 'TEST',
    institutionName: 'Test Institution',
    displayName: 'Test',
    loginBadgeText: 'Test',
    loginTitle: 'Test',
    loginSubtitle: 'Test',
    loginHelperText: 'Test',
    shellTitle: 'Test',
    shellSubtitle: 'Test',
    mobileTitle: 'Test',
    mobileSubtitle: 'Test',
    logoUrl: null,
    loginLogoUrl: null,
    primaryColor: '#000',
    secondaryColor: '#fff',
    accentColor: '#f00',
    backgroundColor: '#fff',
    surfaceColor: '#f5f5f5',
    textColor: '#000',
    contrastTextColor: '#fff',
    mutedTextColor: '#666',
    headingLargeColor: '#000',
    headingMediumColor: '#000',
    bodyTextColor: '#333',
    buttonColor: '#000',
    buttonTextColor: '#fff',
    slides: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BrandingService,
        { provide: AuthService, useValue: { institutionCode: () => 'TEST' } },
      ],
    });
    service = TestBed.inject(BrandingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load public branding', () => {
    service.loadPublicBranding('TEST').subscribe((branding) => {
      expect(branding.institutionCode).toBe('TEST');
      expect(service.branding()).toEqual(mockBranding);
    });

    const req = httpMock.expectOne(`${API_URL}/public/branding?institutionCode=TEST`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBranding);
  });

  it('should load institution branding by id', () => {
    service.loadInstitutionBranding(1).subscribe((branding) => {
      expect(service.branding()).toEqual(mockBranding);
    });

    const req = httpMock.expectOne(`${API_URL}/branding/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBranding);
  });

  it('should save institution branding', () => {
    const payload = {
      displayName: 'Updated',
      loginBadgeText: '',
      loginTitle: '',
      loginSubtitle: '',
      loginHelperText: '',
      shellTitle: '',
      shellSubtitle: '',
      mobileTitle: '',
      mobileSubtitle: '',
      logoUrl: null,
      loginLogoUrl: null,
      primaryColor: '#000',
      secondaryColor: '#fff',
      accentColor: '#f00',
      backgroundColor: '#fff',
      surfaceColor: '#f5f5f5',
      textColor: '#000',
      contrastTextColor: '#fff',
      mutedTextColor: '#666',
      headingLargeColor: '#000',
      headingMediumColor: '#000',
      bodyTextColor: '#333',
      buttonColor: '#000',
      buttonTextColor: '#fff',
      slides: [],
    };

    service.saveInstitutionBranding(1, payload).subscribe((branding) => {
      expect(service.branding()?.displayName).toBe('Updated');
    });

    const req = httpMock.expectOne(`${API_URL}/branding/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockBranding, displayName: 'Updated' });
  });

  it('should select an institution code', () => {
    service.setSelectedInstitutionCode('NEWCODE');
    expect(service.selectedInstitutionCode()).toBe('NEWCODE');
    expect(localStorage.getItem('selected_institution_code')).toBe('NEWCODE');
  });

  it('should load public institutions', () => {
    const institutions = [{ id: 1, code: 'SCH1', name: 'School 1' }];

    service.loadPublicInstitutions().subscribe((result) => {
      expect(result).toEqual(institutions);
      expect(service.publicInstitutions()).toEqual(institutions);
    });

    const req = httpMock.expectOne(`${API_URL}/public/institutions`);
    expect(req.request.method).toBe('GET');
    req.flush(institutions);
  });
});
