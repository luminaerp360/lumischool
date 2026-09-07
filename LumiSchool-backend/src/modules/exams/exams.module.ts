import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Exam,
  ExamSchema,
  ExamResult,
  ExamResultSchema,
} from "./schemas/exam.schema";
import { ExamRepository } from "./repositories/exam.repository";
import { ExamsService } from "./exams.service";
import { ExamsController } from "./exams.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamResult.name, schema: ExamResultSchema },
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService, ExamRepository],
  exports: [ExamsService, ExamRepository],
})
export class ExamsModule {}
