import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsMongoId,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SmsCategory } from "../schemas/sms-log.schema";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class SendSmsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  phoneNumbers: string[];

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: SmsCategory })
  @IsOptional()
  @IsEnum(SmsCategory)
  category?: SmsCategory;
}

export class SendBulkSmsDto {
  @ApiProperty({ description: "Send to all guardians of students in a class" })
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: "Or send to specific guardians",
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  guardianIds?: string[];

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: SmsCategory })
  @IsOptional()
  @IsEnum(SmsCategory)
  category?: SmsCategory;
}

export class SmsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SmsCategory })
  @IsOptional()
  @IsEnum(SmsCategory)
  category?: SmsCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
