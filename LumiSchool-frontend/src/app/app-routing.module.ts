import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";
import { LoginComponent } from "./modules/auth/login/login.component";
import { DashboardComponent } from "./modules/dashboard/dashboard.component";
import { StudentsListComponent } from "./modules/students/students-list/students-list.component";
import { StudentDetailComponent } from "./modules/students/student-detail/student-detail.component";
import { StudentFormComponent } from "./modules/students/student-form/student-form.component";
import { GuardiansListComponent } from "./modules/guardians/guardians-list/guardians-list.component";
import { GuardianDetailComponent } from "./modules/guardians/guardian-detail/guardian-detail.component";
import { GuardianFormComponent } from "./modules/guardians/guardian-form/guardian-form.component";
import { ClassesListComponent } from "./modules/classes/classes-list/classes-list.component";
import { ClassDetailComponent } from "./modules/classes/class-detail/class-detail.component";
import { ClassFormComponent } from "./modules/classes/class-form/class-form.component";
import { AcademicsListComponent } from "./modules/academics/academics-list/academics-list.component";
import { SubjectFormComponent } from "./modules/academics/subject-form/subject-form.component";
import { ExamsListComponent } from "./modules/exams/exams-list/exams-list.component";
import { ExamFormComponent } from "./modules/exams/exam-form/exam-form.component";
import { ExamDetailComponent } from "./modules/exams/exam-detail/exam-detail.component";
import { TeachersListComponent } from "./modules/teachers/teachers-list/teachers-list.component";
import { TeacherDetailComponent } from "./modules/teachers/teacher-detail/teacher-detail.component";
import { TeacherFormComponent } from "./modules/teachers/teacher-form/teacher-form.component";
import { AttendanceListComponent } from "./modules/attendance/attendance-list/attendance-list.component";
import { FinanceListComponent } from "./modules/finance/finance-list/finance-list.component";
import { FeeStructureFormComponent } from "./modules/finance/fee-structure-form/fee-structure-form.component";
import { InvoiceDetailComponent } from "./modules/finance/invoice-detail/invoice-detail.component";
import { CommunicationListComponent } from "./modules/communication/communication-list/communication-list.component";
import { ReportsComponent } from "./modules/reports/reports.component";
import { UsersListComponent } from "./modules/users/users-list/users-list.component";
import { SettingsComponent } from "./modules/settings/settings.component";
import { SystemTenantsComponent } from "./modules/system-tenants/system-tenants.component";
import { AuthGuard } from "./shared/guards/auth.guard";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: DashboardComponent },

      // Students
      { path: "students", component: StudentsListComponent },
      { path: "students/new", component: StudentFormComponent },
      { path: "students/:id/edit", component: StudentFormComponent },
      { path: "students/:id", component: StudentDetailComponent },

      // Guardians
      { path: "guardians", component: GuardiansListComponent },
      { path: "guardians/new", component: GuardianFormComponent },
      { path: "guardians/:id/edit", component: GuardianFormComponent },
      { path: "guardians/:id", component: GuardianDetailComponent },

      // Classes
      { path: "classes", component: ClassesListComponent },
      { path: "classes/new", component: ClassFormComponent },
      { path: "classes/:id/edit", component: ClassFormComponent },
      { path: "classes/:id", component: ClassDetailComponent },

      // Academics
      { path: "academics", component: AcademicsListComponent },
      { path: "academics/new", component: SubjectFormComponent },
      { path: "academics/:id/edit", component: SubjectFormComponent },

      // Exams
      { path: "exams", component: ExamsListComponent },
      { path: "exams/new", component: ExamFormComponent },
      { path: "exams/:id/edit", component: ExamFormComponent },
      { path: "exams/:id", component: ExamDetailComponent },

      // Teachers / Staff
      { path: "teachers", component: TeachersListComponent },
      { path: "teachers/new", component: TeacherFormComponent },
      { path: "teachers/:id/edit", component: TeacherFormComponent },
      { path: "teachers/:id", component: TeacherDetailComponent },

      // Attendance
      { path: "attendance", component: AttendanceListComponent },

      // Finance
      { path: "finance", component: FinanceListComponent },
      {
        path: "finance/fee-structures/new",
        component: FeeStructureFormComponent,
      },
      {
        path: "finance/fee-structures/:id/edit",
        component: FeeStructureFormComponent,
      },
      { path: "finance/invoices/:id", component: InvoiceDetailComponent },

      // Communication
      { path: "communication", component: CommunicationListComponent },

      // Reports, Users, Settings
      { path: "reports", component: ReportsComponent },
      { path: "users", component: UsersListComponent },
      { path: "settings", component: SettingsComponent },
      { path: "system-tenants", component: SystemTenantsComponent },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
