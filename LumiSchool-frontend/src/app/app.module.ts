import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

// Layout
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { HeaderComponent } from "./layout/header/header.component";

// Auth
import { LoginComponent } from "./modules/auth/login/login.component";

// Dashboard
import { DashboardComponent } from "./modules/dashboard/dashboard.component";

// Students
import { StudentsListComponent } from "./modules/students/students-list/students-list.component";
import { StudentDetailComponent } from "./modules/students/student-detail/student-detail.component";
import { StudentFormComponent } from "./modules/students/student-form/student-form.component";

// Guardians
import { GuardiansListComponent } from "./modules/guardians/guardians-list/guardians-list.component";
import { GuardianDetailComponent } from "./modules/guardians/guardian-detail/guardian-detail.component";
import { GuardianFormComponent } from "./modules/guardians/guardian-form/guardian-form.component";

// Classes
import { ClassesListComponent } from "./modules/classes/classes-list/classes-list.component";
import { ClassDetailComponent } from "./modules/classes/class-detail/class-detail.component";
import { ClassFormComponent } from "./modules/classes/class-form/class-form.component";

// Academics
import { AcademicsListComponent } from "./modules/academics/academics-list/academics-list.component";
import { SubjectFormComponent } from "./modules/academics/subject-form/subject-form.component";

// Teachers (Staff)
import { TeachersListComponent } from "./modules/teachers/teachers-list/teachers-list.component";
import { TeacherDetailComponent } from "./modules/teachers/teacher-detail/teacher-detail.component";
import { TeacherFormComponent } from "./modules/teachers/teacher-form/teacher-form.component";

// Exams
import { ExamsListComponent } from "./modules/exams/exams-list/exams-list.component";
import { ExamFormComponent } from "./modules/exams/exam-form/exam-form.component";
import { ExamDetailComponent } from "./modules/exams/exam-detail/exam-detail.component";

// Attendance
import { AttendanceListComponent } from "./modules/attendance/attendance-list/attendance-list.component";

// Finance
import { FinanceListComponent } from "./modules/finance/finance-list/finance-list.component";
import { FeeStructureFormComponent } from "./modules/finance/fee-structure-form/fee-structure-form.component";
import { InvoiceDetailComponent } from "./modules/finance/invoice-detail/invoice-detail.component";

// Communication
import { CommunicationListComponent } from "./modules/communication/communication-list/communication-list.component";

// Reports
import { ReportsComponent } from "./modules/reports/reports.component";

// Users
import { UsersListComponent } from "./modules/users/users-list/users-list.component";

// Settings
import { SettingsComponent } from "./modules/settings/settings.component";

// System Tenants
import { SystemTenantsComponent } from "./modules/system-tenants/system-tenants.component";

// Shared
import { ColorPickerComponent } from "./shared/components/color-picker/color-picker.component";

// Interceptor
import { AuthInterceptor } from "./shared/interceptors/auth.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    StudentsListComponent,
    StudentDetailComponent,
    StudentFormComponent,
    GuardiansListComponent,
    GuardianDetailComponent,
    GuardianFormComponent,
    ClassesListComponent,
    ClassDetailComponent,
    ClassFormComponent,
    AcademicsListComponent,
    SubjectFormComponent,
    ExamsListComponent,
    ExamFormComponent,
    ExamDetailComponent,
    TeachersListComponent,
    TeacherDetailComponent,
    TeacherFormComponent,
    AttendanceListComponent,
    FinanceListComponent,
    FeeStructureFormComponent,
    InvoiceDetailComponent,
    CommunicationListComponent,
    ReportsComponent,
    UsersListComponent,
    SettingsComponent,
    SystemTenantsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
