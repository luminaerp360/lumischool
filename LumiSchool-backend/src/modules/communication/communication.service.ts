import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { CommunicationRepository } from "./repositories/communication.repository";
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementQueryDto,
  SendMessageDto,
  MessageQueryDto,
} from "./dto/communication.dto";
import { ApiResponse } from "../../common/dto/api-response.dto";
import { buildPaginationMeta } from "../../common/utils/pagination.util";

@Injectable()
export class CommunicationService {
  constructor(
    private readonly communicationRepository: CommunicationRepository,
  ) {}

  // ── Announcements ──

  async createAnnouncement(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: CreateAnnouncementDto,
  ) {
    const announcement = await this.communicationRepository.createAnnouncement({
      ...dto,
      tenantId,
      createdById: userId,
      classId: dto.classId ? new Types.ObjectId(dto.classId) : undefined,
    } as any);
    return ApiResponse.success(
      announcement,
      "Announcement created successfully",
    );
  }

  async findAllAnnouncements(
    tenantId: Types.ObjectId,
    query: AnnouncementQueryDto,
  ) {
    const { data, total } =
      await this.communicationRepository.findAllAnnouncements(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return ApiResponse.success({ data, meta }, "Announcements retrieved");
  }

  async findAnnouncementById(tenantId: Types.ObjectId, id: string) {
    const announcement =
      await this.communicationRepository.findAnnouncementById(tenantId, id);
    if (!announcement) throw new NotFoundException("Announcement not found");
    return ApiResponse.success(announcement, "Announcement retrieved");
  }

  async updateAnnouncement(
    tenantId: Types.ObjectId,
    id: string,
    dto: UpdateAnnouncementDto,
  ) {
    const announcement = await this.communicationRepository.updateAnnouncement(
      tenantId,
      id,
      dto as any,
    );
    if (!announcement) throw new NotFoundException("Announcement not found");
    return ApiResponse.success(announcement, "Announcement updated");
  }

  async publishAnnouncement(tenantId: Types.ObjectId, id: string) {
    const announcement = await this.communicationRepository.updateAnnouncement(
      tenantId,
      id,
      {
        isPublished: true,
        publishedAt: new Date(),
      } as any,
    );
    if (!announcement) throw new NotFoundException("Announcement not found");
    // TODO: Emit event to send SMS if sendSms flag is true
    return ApiResponse.success(announcement, "Announcement published");
  }

  async deleteAnnouncement(tenantId: Types.ObjectId, id: string) {
    const announcement = await this.communicationRepository.deleteAnnouncement(
      tenantId,
      id,
    );
    if (!announcement) throw new NotFoundException("Announcement not found");
    return ApiResponse.success(null, "Announcement deleted");
  }

  // ── Messages ──

  async sendMessage(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    dto: SendMessageDto,
  ) {
    const message = await this.communicationRepository.createMessage({
      ...dto,
      tenantId,
      senderId: userId,
      recipientId: new Types.ObjectId(dto.recipientId),
      parentMessageId: dto.parentMessageId
        ? new Types.ObjectId(dto.parentMessageId)
        : undefined,
    } as any);
    return ApiResponse.success(message, "Message sent successfully");
  }

  async findMessages(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    query: MessageQueryDto,
  ) {
    const { data, total } = await this.communicationRepository.findMessages(
      tenantId,
      userId,
      query,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return ApiResponse.success({ data, meta }, "Messages retrieved");
  }

  async findMessageById(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    id: string,
  ) {
    const message = await this.communicationRepository.findMessageById(
      tenantId,
      id,
      userId,
    );
    if (!message) throw new NotFoundException("Message not found");
    // Auto-mark as read if recipient
    if (
      message.recipientId.toString() === userId.toString() &&
      message.status !== "READ"
    ) {
      await this.communicationRepository.markAsRead(tenantId, id, userId);
    }
    return ApiResponse.success(message, "Message retrieved");
  }

  async markAsRead(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    messageId: string,
  ) {
    const message = await this.communicationRepository.markAsRead(
      tenantId,
      messageId,
      userId,
    );
    if (!message) throw new NotFoundException("Message not found");
    return ApiResponse.success(message, "Message marked as read");
  }

  async archiveMessage(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    messageId: string,
  ) {
    const message = await this.communicationRepository.archiveMessage(
      tenantId,
      messageId,
      userId,
    );
    if (!message) throw new NotFoundException("Message not found");
    return ApiResponse.success(null, "Message archived");
  }

  async getUnreadCount(tenantId: Types.ObjectId, userId: Types.ObjectId) {
    const count = await this.communicationRepository.getUnreadCount(
      tenantId,
      userId,
    );
    return ApiResponse.success(
      { unreadCount: count },
      "Unread count retrieved",
    );
  }
}
