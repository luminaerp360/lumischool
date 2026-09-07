import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AcademicsController } from "./academics.controller";
import { AcademicsService } from "./academics.service";
import { AcademicRepository } from "./repositories/academic.repository";
import {
  Subject,
  SubjectSchema,
  SubjectAssignment,
  SubjectAssignmentSchema,
} from "./schemas/subject.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: SubjectAssignment.name, schema: SubjectAssignmentSchema },
    ]),
  ],
  controllers: [AcademicsController],
  providers: [AcademicsService, AcademicRepository],
  exports: [AcademicsService, AcademicRepository],
})
export class AcademicsModule {}
