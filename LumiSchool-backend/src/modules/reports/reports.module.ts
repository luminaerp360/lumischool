import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  GeneratedReport,
  GeneratedReportSchema,
} from "./schemas/report.schema";
import { ReportRepository } from "./repositories/report.repository";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeneratedReport.name, schema: GeneratedReportSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
