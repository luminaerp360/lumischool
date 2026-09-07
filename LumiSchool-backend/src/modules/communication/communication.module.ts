import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Announcement,
  AnnouncementSchema,
  Message,
  MessageSchema,
} from "./schemas/communication.schema";
import { CommunicationRepository } from "./repositories/communication.repository";
import { CommunicationService } from "./communication.service";
import { CommunicationController } from "./communication.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationRepository],
  exports: [CommunicationService],
})
export class CommunicationModule {}
