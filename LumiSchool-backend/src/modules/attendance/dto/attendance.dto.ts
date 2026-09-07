import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AttendanceStatus,
  AttendanceSession,
} from "../schemas/attendance.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class SingleAttendanceDto {
  @ApiProperty()
  @IsMongoId()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class MarkAttendanceDto {
  @ApiProperty()
  @IsMongoId()
  classId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  streamId?: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: AttendanceSession })
  @IsOptional()
  @IsEnum(AttendanceSession)
  session?: AttendanceSession;

  @ApiProperty({ type: [SingleAttendanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleAttendanceDto)
  records: SingleAttendanceDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  term?: string;
}

export class AttendanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ enum: AttendanceSession })
  @IsOptional()
  @IsEnum(AttendanceSession)
  session?: AttendanceSession;
}

export class SyncAttendanceDto {
  @ApiProperty({ type: [MarkAttendanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceDto)
  batches: MarkAttendanceDto[];
}
