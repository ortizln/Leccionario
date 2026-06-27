import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { permissionGuard } from './core/permission.guard';
import { ShellComponent } from './shell.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LessonPlanComponent } from './features/lesson-plans/lesson-plan.component';
import { MobileCloseComponent } from './features/lesson-plans/mobile-close.component';
import { ReportsComponent } from './features/reports/reports.component';
import { UsersComponent } from './features/users/users.component';
import { AcademicManagementComponent } from './features/academic/academic-management.component';
import { AuditComponent } from './features/audit/audit.component';
import { ScheduleManagementComponent } from './features/schedules/schedule-management.component';
import { DemeritManagementComponent } from './features/demerits/demerit-management.component';
import { BrandingManagementComponent } from './features/branding/branding-management.component';
import { CoursesComponent } from './features/academic/courses/courses.component';
import { StudentsComponent } from './features/academic/students/students.component';
import { TeachersComponent } from './features/academic/teachers/teachers.component';
import { SubjectsComponent } from './features/academic/subjects/subjects.component';
import { RepresentativesComponent } from './features/academic/representatives/representatives.component';
import { CatalogsComponent } from './features/academic/catalogs/catalogs.component';
import { MyCourseComponent } from './features/self/my-course/my-course.component';
import { MyTeachingComponent } from './features/self/my-teaching/my-teaching.component';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'mobile/entry-close/:token', component: MobileCloseComponent, data: { mode: 'entry' } },
  { path: 'mobile/log-signature/:token/:signatureType', component: MobileCloseComponent, data: { mode: 'signature' } },
  { path: 'mobile/log-close/:token', component: MobileCloseComponent, data: { mode: 'log' } },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'lesson-plans', component: LessonPlanComponent, canActivate: [permissionGuard], data: { permission: 'LESSONPLAN_VIEW' } },
      { path: 'reports', component: ReportsComponent, canActivate: [permissionGuard], data: { permission: 'REPORT_VIEW' } },
      { path: 'users', component: UsersComponent, canActivate: [permissionGuard], data: { permission: 'USER_VIEW' } },
      {
        path: 'academic',
        component: AcademicManagementComponent,
        canActivate: [permissionGuard],
        data: { permission: 'ACADEMIC_VIEW' },
        children: [
          { path: '', redirectTo: 'courses', pathMatch: 'full' },
          { path: 'courses', component: CoursesComponent },
          { path: 'students', component: StudentsComponent },
          { path: 'teachers', component: TeachersComponent },
          { path: 'subjects', component: SubjectsComponent },
          { path: 'representatives', component: RepresentativesComponent },
          { path: 'catalogs', component: CatalogsComponent }
        ]
      },
      { path: 'schedules', component: ScheduleManagementComponent, canActivate: [permissionGuard], data: { permission: 'ACADEMIC_VIEW' } },
      { path: 'my-course', component: MyCourseComponent, canActivate: [permissionGuard], data: { permission: 'STUDENT_SELF_VIEW', denyRoles: ['ROLE_ADMINISTRADOR', 'ROLE_ADMINISTRATIVO'] } },
      { path: 'my-teaching', component: MyTeachingComponent, canActivate: [permissionGuard], data: { permission: 'TEACHER_SELF_VIEW', denyRoles: ['ROLE_ADMINISTRADOR', 'ROLE_ADMINISTRATIVO'] } },
      { path: 'demerits', component: DemeritManagementComponent, canActivate: [permissionGuard], data: { permission: 'ACADEMIC_VIEW' } },
      { path: 'audit', component: AuditComponent, canActivate: [permissionGuard], data: { permission: 'AUDIT_VIEW' } },
      { path: 'branding', component: BrandingManagementComponent, canActivate: [permissionGuard], data: { permission: 'SETTINGS_VIEW' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
