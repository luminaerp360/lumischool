import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsObject,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ReportType,
  ReportFormat,
  ReportStatus,
} from "../schemas/report.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class GenerateReportDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({ enum: ReportFormat })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({ description: "Filter parameters for the report" })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class ReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
