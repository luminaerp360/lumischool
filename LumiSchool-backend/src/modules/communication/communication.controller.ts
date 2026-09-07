import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CommunicationService } from "./communication.service";
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementQueryDto,
  SendMessageDto,
  MessageQueryDto,
} from "./dto/communication.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../common/enums/roles.enum";
import { Types } from "mongoose";

@ApiTags("Communication")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("communication")
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  // ── Announcements ──

  @Post("announcements")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create announcement" })
  createAnnouncement(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.communicationService.createAnnouncement(tenantId, userId, dto);
  }

  @Get("announcements")
  @ApiOperation({ summary: "List announcements" })
  findAllAnnouncements(
    @TenantId() tenantId: Types.ObjectId,
    @Query() query: AnnouncementQueryDto,
  ) {
    return this.communicationService.findAllAnnouncements(tenantId, query);
  }

  @Get("announcements/:id")
  @ApiOperation({ summary: "Get announcement by ID" })
  findAnnouncement(
    @TenantId() tenantId: Types.ObjectId,
    @Param("id") id: string,
  ) {
    return this.communicationService.findAnnouncementById(tenantId, id);
  }

  @Put("announcements/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update announcement" })
  updateAnnouncement(
    @TenantId() tenantId: Types.ObjectId,
    @Param("id") id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.communicationService.updateAnnouncement(tenantId, id, dto);
  }

  @Patch("announcements/:id/publish")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Publish announcement" })
  publishAnnouncement(
    @TenantId() tenantId: Types.ObjectId,
    @Param("id") id: string,
  ) {
    return this.communicationService.publishAnnouncement(tenantId, id);
  }

  @Delete("announcements/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Delete announcement" })
  deleteAnnouncement(
    @TenantId() tenantId: Types.ObjectId,
    @Param("id") id: string,
  ) {
    return this.communicationService.deleteAnnouncement(tenantId, id);
  }

  // ── Messages ──

  @Post("messages")
  @ApiOperation({ summary: "Send a message" })
  sendMessage(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Body() dto: SendMessageDto,
  ) {
    return this.communicationService.sendMessage(tenantId, userId, dto);
  }

  @Get("messages")
  @ApiOperation({ summary: "List messages (inbox or sent)" })
  findMessages(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Query() query: MessageQueryDto,
  ) {
    return this.communicationService.findMessages(tenantId, userId, query);
  }

  @Get("messages/unread-count")
  @ApiOperation({ summary: "Get unread message count" })
  getUnreadCount(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
  ) {
    return this.communicationService.getUnreadCount(tenantId, userId);
  }

  @Get("messages/:id")
  @ApiOperation({ summary: "Get message by ID (auto-marks as read)" })
  findMessage(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Param("id") id: string,
  ) {
    return this.communicationService.findMessageById(tenantId, userId, id);
  }

  @Patch("messages/:id/read")
  @ApiOperation({ summary: "Mark message as read" })
  markAsRead(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Param("id") id: string,
  ) {
    return this.communicationService.markAsRead(tenantId, userId, id);
  }

  @Patch("messages/:id/archive")
  @ApiOperation({ summary: "Archive message" })
  archiveMessage(
    @TenantId() tenantId: Types.ObjectId,
    @CurrentUser("_id") userId: Types.ObjectId,
    @Param("id") id: string,
  ) {
    return this.communicationService.archiveMessage(tenantId, userId, id);
  }
}
