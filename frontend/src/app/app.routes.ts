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
import { AnnouncementsComponent } from './features/announcements/announcements.component';
import { AnnouncementEditorComponent } from './features/announcements/announcement-editor.component';
import { CoursesComponent } from './features/academic/courses/courses.component';
import { StudentsComponent } from './features/academic/students/students.component';
import { TeachersComponent } from './features/academic/teachers/teachers.component';
import { SubjectsComponent } from './features/academic/subjects/subjects.component';
import { RepresentativesComponent } from './features/academic/representatives/representatives.component';
import { CatalogsComponent } from './features/academic/catalogs/catalogs.component';
import { MyCourseComponent } from './features/self/my-course/my-course.component';
import { MyTeachingComponent } from './features/self/my-teaching/my-teaching.component';
import { GradingManagementComponent } from './features/grading/grading-management.component';
import { ReportCardsComponent } from './features/report-cards/report-cards.component';
import { AcademicHistoryComponent } from './features/academic-history/academic-history.component';
import { CertificatesComponent } from './features/certificates/certificates.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { ConductComponent } from './features/conduct/conduct.component';
import { TutoringComponent } from './features/tutoring/tutoring.component';
import { QuestionBankComponent } from './features/question-bank/question-bank.component';
import { EnrollmentComponent } from './features/enrollment/enrollment.component';
import { NeeComponent } from './features/nee/nee.component';
import { DeceComponent } from './features/dece/dece.component';
import { CampusComponent } from './features/institution/campus.component';
import { ShiftsComponent } from './features/institution/shifts.component';
import { ClassroomsComponent } from './features/institution/classrooms.component';
import { SchoolCalendarComponent } from './features/institution/school-calendar.component';
import { InstitutionSettingsComponent } from './features/institution/institution-settings.component';
import { InstitutionReportsComponent } from './features/institution/institution-reports.component';
import { EmployeesComponent } from './features/rrhh/employees.component';
import { ContractsComponent } from './features/rrhh/contracts.component';
import { StaffVacationsComponent } from './features/rrhh/staff-vacations.component';
import { TrainingComponent } from './features/rrhh/training.component';
import { StudentHealthComponent } from './features/student-welfare/student-health.component';
import { ScholarshipsComponent } from './features/student-welfare/scholarships.component';
import { ClubsComponent } from './features/student-welfare/clubs.component';
import { TransportComponent } from './features/student-welfare/transport.component';
import { CashierComponent } from './features/finance/cashier.component';
import { InvoicesComponent } from './features/finance/invoices.component';
import { TuitionComponent } from './features/finance/tuition.component';
import { AccountsReceivableComponent } from './features/finance/accounts-receivable.component';
import { CreditNotesComponent } from './features/finance/credit-notes.component';
import { FinanceReportsComponent } from './features/finance/finance-reports.component';
import { AssetsComponent } from './features/inventory/assets.component';
import { AssetCategoriesComponent } from './features/inventory/asset-categories.component';
import { MaintenanceReportComponent } from './features/inventory/maintenance-report.component';
import { AssetAssignmentsComponent } from './features/inventory/asset-assignments.component';
import { InventoryReportsComponent } from './features/inventory/inventory-reports.component';
import { LibraryComponent } from './features/library/library.component';
import { BookCategoriesComponent } from './features/library/book-categories.component';
import { BookLoansManagementComponent } from './features/library/book-loans-management.component';
import { BookSearchComponent } from './features/library/book-search.component';
import { BookReservationsComponent } from './features/library/book-reservations.component';
import { BookReportsComponent } from './features/library/book-reports.component';
import { BiDashboardComponent } from './features/bi/bi-dashboard.component';
import { BiReportsComponent } from './features/bi/bi-reports.component';
import { BiStudentAnalyticsComponent } from './features/bi/bi-student-analytics.component';
import { BiDrillDownComponent } from './features/bi/bi-drill-down.component';
import { RoleDashboardComponent } from './features/bi/role-dashboard.component';
import { NotificationsComponent } from './features/communication/notifications.component';
import { ParentCommComponent } from './features/communication/parent-comm.component';
import { NotificationTemplatesComponent } from './features/communication/notification-templates.component';
import { CommunicationGroupsComponent } from './features/communication/communication-groups.component';
import { CommunicationStatsComponent } from './features/communication/communication-stats.component';
import { CommunicationPortalComponent } from './features/communication/communication-portal.component';
import { MessagesComponent } from './features/communication/messages.component';
import { AiDashboardComponent } from './features/ai/ai-dashboard.component';
import { StudentAiProfileComponent } from './features/ai/student-ai-profile.component';
import { BatchPredictionsComponent } from './features/ai/batch-predictions.component';
import { AiModelManagementComponent } from './features/ai/ai-model-management.component';
import { AiLearningStyleComponent } from './features/ai/ai-learning-style.component';
import { AiStudyPlanComponent } from './features/ai/ai-study-plan.component';
import { AiRecommendationsComponent } from './features/ai/ai-recommendations.component';
import { AiAnomaliesComponent } from './features/ai/ai-anomalies.component';
import { VacanciesComponent } from './features/rrhh/vacancies.component';
import { DataExportComponent } from './features/export/data-export.component';
import { TrainingContentComponent } from './features/rrhh/training-content.component';
import { EmployeeActionsComponent } from './features/rrhh/employee-actions.component';
import { EmployeeBenefitsComponent } from './features/rrhh/employee-benefits.component';
import { StudentInsuranceComponent } from './features/student-welfare/student-insurance.component';
import { PsychEvaluationsComponent } from './features/student-welfare/psych-evaluations.component';
import { StudentWellnessDashboardComponent } from './features/student-welfare/student-wellness-dashboard.component';
import { StudentTrackingComponent } from './features/student-welfare/student-tracking.component';
import { StaffPermissionsComponent } from './features/rrhh/staff-permissions.component';
import { PayrollComponent } from './features/rrhh/payroll.component';
import { HolidaysComponent } from './features/rrhh/holidays.component';
import { EmployeeAttendanceComponent } from './features/rrhh/employee-attendance.component';
import { EmployeeEvaluationComponent } from './features/rrhh/employee-evaluation.component';
import { FinancialDiscountsComponent } from './features/finance/financial-discounts.component';
import { SuppliersComponent } from './features/inventory/suppliers.component';
import { LibraryFinesComponent } from './features/library/library-fines.component';
import { AssetCustodiansComponent } from './features/inventory/asset-custodians.component';
import { PurchaseOrdersComponent } from './features/inventory/purchase-orders.component';
import { AssetDepreciationComponent } from './features/inventory/asset-depreciation.component';
import { CircularsComponent } from './features/communication/circulars.component';
import { SchoolEventsComponent } from './features/communication/school-events.component';
import { AcademicPeriodsComponent } from './features/institution/academic-periods.component';
import { RubricsComponent } from './features/grading/rubrics.component';
import { CompetenciesComponent } from './features/grading/competencies.component';
import { RecoveryExamsComponent } from './features/grading/recovery-exams.component';
import { CurricularAdaptationsComponent } from './features/academic/curricular-adaptations.component';
import { AccountStatementsComponent } from './features/finance/account-statements.component';
import { AssetWarrantiesComponent } from './features/inventory/asset-warranties.component';
import { AgendaComponent } from './features/institution/agenda.component';
import { NotificationSchedulerComponent } from './features/system/notification-scheduler.component';
import { SriIntegrationComponent } from './features/institution/sri-integration.component';

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
      { path: 'grading', component: GradingManagementComponent, canActivate: [permissionGuard], data: { permission: 'GRADE_VIEW' } },
      { path: 'report-cards', component: ReportCardsComponent, canActivate: [permissionGuard], data: { permission: 'LIBRETA_VIEW' } },
      { path: 'academic-history', component: AcademicHistoryComponent, canActivate: [permissionGuard], data: { permission: 'HISTORIAL_VIEW' } },
      { path: 'certificates', component: CertificatesComponent, canActivate: [permissionGuard], data: { permission: 'CERTIFICADO_VIEW' } },
      { path: 'attendance', component: AttendanceComponent, canActivate: [permissionGuard], data: { permission: 'ASISTENCIA_VIEW' } },
      { path: 'conduct', component: ConductComponent, canActivate: [permissionGuard], data: { permission: 'CONDUCTA_VIEW' } },
      { path: 'tutoring', component: TutoringComponent, canActivate: [permissionGuard], data: { permission: 'TUTORIA_VIEW' } },
      { path: 'question-bank', component: QuestionBankComponent, canActivate: [permissionGuard], data: { permission: 'BANCO_PREGUNTAS_VIEW' } },
      { path: 'enrollment', component: EnrollmentComponent, canActivate: [permissionGuard], data: { permission: 'MATRICULA_VIEW' } },
      { path: 'nee', component: NeeComponent, canActivate: [permissionGuard], data: { permission: 'NEE_VIEW' } },
      { path: 'dece', component: DeceComponent, canActivate: [permissionGuard], data: { permission: 'DECE_VIEW' } },
      { path: 'campus', component: CampusComponent, canActivate: [permissionGuard], data: { permission: 'CAMPUS_VIEW' } },
      { path: 'shifts', component: ShiftsComponent, canActivate: [permissionGuard], data: { permission: 'SHIFT_VIEW' } },
      { path: 'classrooms', component: ClassroomsComponent, canActivate: [permissionGuard], data: { permission: 'CLASSROOM_VIEW' } },
      { path: 'calendar', component: SchoolCalendarComponent, canActivate: [permissionGuard], data: { permission: 'CALENDAR_VIEW' } },
      { path: 'institution-settings', component: InstitutionSettingsComponent, canActivate: [permissionGuard], data: { permission: 'INSTITUTION_CONFIG_VIEW' } },
      { path: 'institution-reports', component: InstitutionReportsComponent, canActivate: [permissionGuard], data: { permission: 'INSTITUTION_VIEW' } },
      { path: 'employees', component: EmployeesComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'contracts', component: ContractsComponent, canActivate: [permissionGuard], data: { permission: 'HR_CONTRACT_VIEW' } },
      { path: 'staff-vacations', component: StaffVacationsComponent, canActivate: [permissionGuard], data: { permission: 'HR_VACATION_VIEW' } },
      { path: 'training', component: TrainingComponent, canActivate: [permissionGuard], data: { permission: 'HR_TRAINING_VIEW' } },
      { path: 'student-health', component: StudentHealthComponent, canActivate: [permissionGuard], data: { permission: 'STUDENT_WELFARE_VIEW' } },
      { path: 'scholarships', component: ScholarshipsComponent, canActivate: [permissionGuard], data: { permission: 'SCHOLARSHIP_VIEW' } },
      { path: 'clubs', component: ClubsComponent, canActivate: [permissionGuard], data: { permission: 'CLUB_VIEW' } },
      { path: 'transport', component: TransportComponent, canActivate: [permissionGuard], data: { permission: 'TRANSPORT_VIEW' } },
      { path: 'cashier', component: CashierComponent, canActivate: [permissionGuard], data: { permission: 'CASHIER_VIEW' } },
      { path: 'invoices', component: InvoicesComponent, canActivate: [permissionGuard], data: { permission: 'INVOICE_VIEW' } },
      { path: 'tuition', component: TuitionComponent, canActivate: [permissionGuard], data: { permission: 'TUITION_VIEW' } },
      { path: 'accounts-receivable', component: AccountsReceivableComponent, canActivate: [permissionGuard], data: { permission: 'RECEIVABLE_VIEW' } },
      { path: 'credit-notes', component: CreditNotesComponent, canActivate: [permissionGuard], data: { permission: 'FINANCE_VIEW' } },
      { path: 'finance-reports', component: FinanceReportsComponent, canActivate: [permissionGuard], data: { permission: 'FINANCE_VIEW' } },
      { path: 'assets', component: AssetsComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'asset-categories', component: AssetCategoriesComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'maintenance-report', component: MaintenanceReportComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_MAINTENANCE_VIEW' } },
      { path: 'asset-assignments', component: AssetAssignmentsComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'inventory-reports', component: InventoryReportsComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'library', component: LibraryComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_VIEW' } },
      { path: 'library/categories', component: BookCategoriesComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_VIEW' } },
      { path: 'library/search', component: BookSearchComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_VIEW' } },
      { path: 'book-loans', component: BookLoansManagementComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_LOAN_VIEW' } },
      { path: 'book-reservations', component: BookReservationsComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_VIEW' } },
      { path: 'book-reports', component: BookReportsComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_VIEW' } },
      { path: 'bi-dashboard', component: BiDashboardComponent, canActivate: [permissionGuard], data: { permission: 'BI_DASHBOARD_VIEW' } },
      { path: 'bi-reports', component: BiReportsComponent, canActivate: [permissionGuard], data: { permission: 'BI_REPORT_VIEW' } },
      { path: 'bi-student-analytics', component: BiStudentAnalyticsComponent, canActivate: [permissionGuard], data: { permission: 'BI_DASHBOARD_VIEW' } },
      { path: 'bi-drill-down', component: BiDrillDownComponent, canActivate: [permissionGuard], data: { permission: 'BI_DASHBOARD_VIEW' } },
      { path: 'role-dashboard', component: RoleDashboardComponent, canActivate: [permissionGuard], data: { permission: 'BI_DASHBOARD_VIEW' } },
      { path: 'notifications', component: NotificationsComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_VIEW' } },
      { path: 'parent-comm', component: ParentCommComponent, canActivate: [permissionGuard], data: { permission: 'PARENT_COMM_VIEW' } },
      { path: 'notification-templates', component: NotificationTemplatesComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_MANAGE' } },
      { path: 'communication-groups', component: CommunicationGroupsComponent, canActivate: [permissionGuard], data: { permission: 'COMM_GROUP_MANAGE' } },
      { path: 'communication-stats', component: CommunicationStatsComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_VIEW' } },
      { path: 'communication-portal', component: CommunicationPortalComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_VIEW' } },
      { path: 'messages', component: MessagesComponent, canActivate: [permissionGuard], data: { permission: 'MESSAGE_VIEW' } },
      { path: 'circulars', component: CircularsComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_VIEW' } },
      { path: 'school-events', component: SchoolEventsComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_VIEW' } },
      { path: 'ai-dashboard', component: AiDashboardComponent, canActivate: [permissionGuard], data: { permission: 'AI_VIEW' } },
      { path: 'ai-student-profile', component: StudentAiProfileComponent, canActivate: [permissionGuard], data: { permission: 'AI_ANALYZE' } },
      { path: 'batch-predictions', component: BatchPredictionsComponent, canActivate: [permissionGuard], data: { permission: 'AI_VIEW' } },
      { path: 'ai-models', component: AiModelManagementComponent, canActivate: [permissionGuard], data: { permission: 'AI_MANAGE' } },
      { path: 'ai-learning-styles', component: AiLearningStyleComponent, canActivate: [permissionGuard], data: { permission: 'AI_VIEW' } },
      { path: 'ai-study-plans', component: AiStudyPlanComponent, canActivate: [permissionGuard], data: { permission: 'AI_VIEW' } },
      { path: 'ai-recommendations', component: AiRecommendationsComponent, canActivate: [permissionGuard], data: { permission: 'AI_VIEW' } },
      { path: 'ai-anomalies', component: AiAnomaliesComponent, canActivate: [permissionGuard], data: { permission: 'AI_VIEW' } },
      { path: 'student-insurance', component: StudentInsuranceComponent, canActivate: [permissionGuard], data: { permission: 'STUDENT_WELFARE_VIEW' } },
      { path: 'psych-evaluations', component: PsychEvaluationsComponent, canActivate: [permissionGuard], data: { permission: 'STUDENT_WELFARE_VIEW' } },
      { path: 'wellness-dashboard', component: StudentWellnessDashboardComponent, canActivate: [permissionGuard], data: { permission: 'STUDENT_WELFARE_VIEW' } },
      { path: 'student-tracking', component: StudentTrackingComponent, canActivate: [permissionGuard], data: { permission: 'STUDENT_WELFARE_VIEW' } },
      { path: 'staff-permissions', component: StaffPermissionsComponent, canActivate: [permissionGuard], data: { permission: 'HR_PERMISSION_VIEW' } },
      { path: 'payroll', component: PayrollComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'holidays', component: HolidaysComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'employee-attendance', component: EmployeeAttendanceComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'employee-evaluations', component: EmployeeEvaluationComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'vacancies', component: VacanciesComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'training-content', component: TrainingContentComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'employee-actions', component: EmployeeActionsComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'employee-benefits', component: EmployeeBenefitsComponent, canActivate: [permissionGuard], data: { permission: 'HR_VIEW' } },
      { path: 'financial-discounts', component: FinancialDiscountsComponent, canActivate: [permissionGuard], data: { permission: 'FINANCE_VIEW' } },
      { path: 'suppliers', component: SuppliersComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'asset-custodians', component: AssetCustodiansComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'purchase-orders', component: PurchaseOrdersComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'asset-depreciation', component: AssetDepreciationComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'library-fines', component: LibraryFinesComponent, canActivate: [permissionGuard], data: { permission: 'LIBRARY_VIEW' } },
      { path: 'announcements', component: AnnouncementsComponent, canActivate: [permissionGuard], data: { permission: 'ANNOUNCEMENT_VIEW' } },
      { path: 'announcements/new', component: AnnouncementEditorComponent, canActivate: [permissionGuard], data: { permission: 'ANNOUNCEMENT_MANAGE' } },
      { path: 'announcements/edit/:id', component: AnnouncementEditorComponent, canActivate: [permissionGuard], data: { permission: 'ANNOUNCEMENT_MANAGE' } },
      { path: 'audit', component: AuditComponent, canActivate: [permissionGuard], data: { permission: 'AUDIT_VIEW' } },
      { path: 'data-export', component: DataExportComponent, canActivate: [permissionGuard], data: { permission: 'REPORT_EXPORT' } },
      { path: 'branding', component: BrandingManagementComponent, canActivate: [permissionGuard], data: { permission: 'SETTINGS_VIEW' } },
      { path: 'academic-periods', component: AcademicPeriodsComponent, canActivate: [permissionGuard], data: { permission: 'INSTITUTION_CONFIG_VIEW' } },
      { path: 'rubrics', component: RubricsComponent, canActivate: [permissionGuard], data: { permission: 'GRADE_MANAGE' } },
      { path: 'competencies', component: CompetenciesComponent, canActivate: [permissionGuard], data: { permission: 'GRADE_MANAGE' } },
      { path: 'recovery-exams', component: RecoveryExamsComponent, canActivate: [permissionGuard], data: { permission: 'GRADE_MANAGE' } },
      { path: 'curricular-adaptations', component: CurricularAdaptationsComponent, canActivate: [permissionGuard], data: { permission: 'ACADEMIC_MANAGE' } },
      { path: 'account-statements', component: AccountStatementsComponent, canActivate: [permissionGuard], data: { permission: 'RECEIVABLE_VIEW' } },
      { path: 'asset-warranties', component: AssetWarrantiesComponent, canActivate: [permissionGuard], data: { permission: 'ASSET_VIEW' } },
      { path: 'agenda', component: AgendaComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_VIEW' } },
      { path: 'notification-scheduler', component: NotificationSchedulerComponent, canActivate: [permissionGuard], data: { permission: 'NOTIFICATION_MANAGE' } },
      { path: 'sri-integration', component: SriIntegrationComponent, canActivate: [permissionGuard], data: { permission: 'INSTITUTION_CONFIG_VIEW' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
