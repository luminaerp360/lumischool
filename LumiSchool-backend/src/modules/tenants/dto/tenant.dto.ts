import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  ValidateNested,
} from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SchoolType, SmsProvider, Term } from "../schemas/tenant.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateTenantDto {
  @ApiProperty({ example: "St. Mary's Primary School" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "st-marys-primary" })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ enum: SchoolType, example: SchoolType.PRIMARY })
  @IsEnum(SchoolType)
  schoolType: SchoolType;

  @ApiProperty({ example: "Nairobi" })
  @IsString()
  @IsNotEmpty()
  county: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subCounty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: "0712345678" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: "school@example.com" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {}

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional({ enum: SmsProvider })
  @IsEnum(SmsProvider)
  @IsOptional()
  smsProvider?: SmsProvider;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  enableRanking?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  enableBoarding?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  enableTransport?: boolean;

  @ApiPropertyOptional({ example: "2026" })
  @IsString()
  @IsOptional()
  academicYear?: string;

  @ApiPropertyOptional({ enum: Term })
  @IsEnum(Term)
  @IsOptional()
  currentTerm?: Term;

  @ApiPropertyOptional({
    example: "ADM-",
    description: "Prefix prepended to auto-generated admission numbers (e.g. 'ADM-', 'SMS/', 'STMA-')",
  })
  @IsString()
  @IsOptional()
  admissionNumberPrefix?: string;

  @ApiPropertyOptional({
    example: 1113,
    description: "The next admission number to assign. Increments automatically after each use.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  admissionNumberNext?: number;
}

export class TenantQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  county?: string;

  @ApiPropertyOptional({ enum: SchoolType })
  @IsEnum(SchoolType)
  @IsOptional()
  schoolType?: SchoolType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
