import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FinanceController } from "./finance.controller";
import { FinanceService } from "./finance.service";
import { FinanceRepository } from "./repositories/finance.repository";
import {
  FeeStructure,
  FeeStructureSchema,
  FeeInvoice,
  FeeInvoiceSchema,
  FeePayment,
  FeePaymentSchema,
} from "./schemas/finance.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: FeeInvoice.name, schema: FeeInvoiceSchema },
      { name: FeePayment.name, schema: FeePaymentSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, FinanceRepository],
  exports: [FinanceService, FinanceRepository],
})
export class FinanceModule {}
