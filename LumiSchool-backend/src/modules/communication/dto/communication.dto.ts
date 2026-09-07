import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsBoolean,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  AnnouncementAudience,
  AnnouncementPriority,
} from "../schemas/communication.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

// ── Announcement DTOs ──

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ enum: AnnouncementAudience })
  @IsEnum(AnnouncementAudience)
  audience: AnnouncementAudience;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @ApiPropertyOptional({ enum: AnnouncementPriority })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  sendSms?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}

export class AnnouncementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AnnouncementAudience })
  @IsOptional()
  @IsEnum(AnnouncementAudience)
  audience?: AnnouncementAudience;

  @ApiPropertyOptional({ enum: AnnouncementPriority })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

// ── Message DTOs ──

export class SendMessageDto {
  @ApiProperty()
  @IsMongoId()
  recipientId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  parentMessageId?: string;
}

export class MessageQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ["inbox", "sent"] })
  @IsOptional()
  @IsString()
  folder?: "inbox" | "sent";
}
