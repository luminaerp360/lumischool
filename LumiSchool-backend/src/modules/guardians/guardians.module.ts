import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GuardiansController } from "./guardians.controller";
import { GuardiansService } from "./guardians.service";
import { GuardianRepository } from "./repositories/guardian.repository";
import { Guardian, GuardianSchema } from "./schemas/guardian.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guardian.name, schema: GuardianSchema },
    ]),
  ],
  controllers: [GuardiansController],
  providers: [GuardiansService, GuardianRepository],
  exports: [GuardiansService, GuardianRepository],
})
export class GuardiansModule {}
