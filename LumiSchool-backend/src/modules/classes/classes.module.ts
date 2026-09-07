import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import { ClassRepository } from "./repositories/class.repository";
import {
  Class,
  ClassSchema,
  Stream,
  StreamSchema,
} from "./schemas/class.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: Stream.name, schema: StreamSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService, ClassRepository],
  exports: [ClassesService, ClassRepository],
})
export class ClassesModule {}
