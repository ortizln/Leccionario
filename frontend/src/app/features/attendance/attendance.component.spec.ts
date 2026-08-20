import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceComponent } from './attendance.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_URL } from '../../core/api.config';

describe('AttendanceComponent', () => {
  let component: AttendanceComponent;
  let fixture: ComponentFixture<AttendanceComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceComponent);
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

  it('should load courses and periods on init', () => {
    const req1 = httpMock.expectOne(`${API_URL}/academic/courses`);
    req1.flush([{ id: 1, name: '1ro A' }]);

    const req2 = httpMock.expectOne(`${API_URL}/academic/catalogs/academic-years`);
    req2.flush([{ id: 1, name: '2026' }]);

    expect(component.courses.length).toBe(1);
    expect(component.periods.length).toBe(1);
  });

  it('should not load data when courseId or periodId is null', () => {
    httpMock.expectOne(`${API_URL}/academic/courses`).flush([]);
    httpMock.expectOne(`${API_URL}/academic/catalogs/academic-years`).flush([]);

    component.courseId = null;
    component.periodId = 1;
    component.loadCourseData();
    // No additional HTTP requests should be made
  });

  it('should load course data when both ids are set', () => {
    httpMock.expectOne(`${API_URL}/academic/courses`).flush([]);
    httpMock.expectOne(`${API_URL}/academic/catalogs/academic-years`).flush([]);

    component.courseId = 1;
    component.periodId = 1;
    component.loadCourseData();

    const statsReq = httpMock.expectOne(`${API_URL}/attendance/course/1/period/1/stats`);
    statsReq.flush({ totalAbsences: 5, byType: { ABSENT: 3, LATE: 2 } });

    const absencesReq = httpMock.expectOne(`${API_URL}/attendance/course/1/period/1`);
    absencesReq.flush([]);

    const summaryReq = httpMock.expectOne(`${API_URL}/attendance/course/1/period/1/by-student`);
    summaryReq.flush([]);

    expect(component.courseStats.totalAbsences).toBe(5);
  });

  it('absenceLabel should return correct labels', () => {
    expect(component.absenceLabel('ABSENT')).toBe('Ausente');
    expect(component.absenceLabel('LATE')).toBe('Tardanza');
    expect(component.absenceLabel('JUSTIFIED')).toBe('Justificada');
    expect(component.absenceLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should default to course tab', () => {
    expect(component.tab).toBe('course');
  });

  it('should switch tabs', () => {
    component.tab = 'student';
    expect(component.tab).toBe('student');
  });
});
