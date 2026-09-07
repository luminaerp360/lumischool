import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Announcement,
  AnnouncementDocument,
  Message,
  MessageDocument,
} from "../schemas/communication.schema";
import { buildMongoosePaginationOptions } from "../../../common/utils/pagination.util";

@Injectable()
export class CommunicationRepository {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // ── Announcements ──

  async createAnnouncement(
    data: Partial<Announcement>,
  ): Promise<AnnouncementDocument> {
    return this.announcementModel.create(data);
  }

  async findAnnouncementById(
    tenantId: Types.ObjectId,
    id: string,
  ): Promise<AnnouncementDocument | null> {
    return this.announcementModel
      .findOne({ _id: id, tenantId })
      .populate("createdById", "firstName lastName")
      .populate("classId", "name")
      .exec();
  }

  async findAllAnnouncements(
    tenantId: Types.ObjectId,
    query: any,
  ): Promise<{ data: AnnouncementDocument[]; total: number }> {
    const filter: any = { tenantId, isActive: true };
    if (query.audience) filter.audience = query.audience;
    if (query.priority) filter.priority = query.priority;
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.announcementModel
        .find(filter)
        .populate("createdById", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.announcementModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async updateAnnouncement(
    tenantId: Types.ObjectId,
    id: string,
    data: Partial<Announcement>,
  ): Promise<AnnouncementDocument | null> {
    return this.announcementModel
      .findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true })
      .exec();
  }

  async deleteAnnouncement(
    tenantId: Types.ObjectId,
    id: string,
  ): Promise<AnnouncementDocument | null> {
    return this.announcementModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();
  }

  // ── Messages ──

  async createMessage(data: Partial<Message>): Promise<MessageDocument> {
    return this.messageModel.create(data);
  }

  async findMessageById(
    tenantId: Types.ObjectId,
    id: string,
    userId: Types.ObjectId,
  ): Promise<MessageDocument | null> {
    return this.messageModel
      .findOne({
        _id: id,
        tenantId,
        $or: [{ senderId: userId }, { recipientId: userId }],
      })
      .populate("senderId", "firstName lastName email")
      .populate("recipientId", "firstName lastName email")
      .exec();
  }

  async findMessages(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    query: any,
  ): Promise<{ data: MessageDocument[]; total: number }> {
    const filter: any = { tenantId, isArchived: false };
    if (query.folder === "sent") {
      filter.senderId = userId;
    } else {
      filter.recipientId = userId;
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .populate("senderId", "firstName lastName")
        .populate("recipientId", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async markAsRead(
    tenantId: Types.ObjectId,
    messageId: string,
    userId: Types.ObjectId,
  ): Promise<MessageDocument | null> {
    return this.messageModel
      .findOneAndUpdate(
        { _id: messageId, tenantId, recipientId: userId },
        { $set: { status: "READ", readAt: new Date() } },
        { new: true },
      )
      .exec();
  }

  async archiveMessage(
    tenantId: Types.ObjectId,
    messageId: string,
    userId: Types.ObjectId,
  ): Promise<MessageDocument | null> {
    return this.messageModel
      .findOneAndUpdate(
        {
          _id: messageId,
          tenantId,
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
        { $set: { isArchived: true } },
        { new: true },
      )
      .exec();
  }

  async getUnreadCount(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<number> {
    return this.messageModel
      .countDocuments({ tenantId, recipientId: userId, status: "SENT" })
      .exec();
  }
}
