import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  GeneratedReport,
  GeneratedReportSchema,
} from "./schemas/report.schema";
import { ReportRepository } from "./repositories/report.repository";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { Student, StudentSchema } from "../students/schemas/student.schema";
import { Class, ClassSchema } from "../classes/schemas/class.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Guardian, GuardianSchema } from "../guardians/schemas/guardian.schema";
import { FeeInvoice, FeeInvoiceSchema } from "../finance/schemas/finance.schema";
import { Attendance, AttendanceSchema } from "../attendance/schemas/attendance.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneratedReport.name, schema: GeneratedReportSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Class.name, schema: ClassSchema },
      { name: User.name, schema: UserSchema },
      { name: Guardian.name, schema: GuardianSchema },
      { name: FeeInvoice.name, schema: FeeInvoiceSchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
