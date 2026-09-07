import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SmsController } from "./sms.controller";
import { SmsService } from "./sms.service";
import { SmsLog, SmsLogSchema } from "./schemas/sms-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SmsLog.name, schema: SmsLogSchema }]),
  ],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
