import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";
import { StudentRepository } from "./repositories/student.repository";
import { Student, StudentSchema } from "./schemas/student.schema";
import {
  PromotionHistory,
  PromotionHistorySchema,
} from "./schemas/promotion-history.schema";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: PromotionHistory.name, schema: PromotionHistorySchema },
    ]),
    forwardRef(() => TenantsModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, StudentRepository],
  exports: [StudentsService, StudentRepository],
})
export class StudentsModule {}
