import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsArray,
  IsMongoId,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Relationship } from "../schemas/guardian.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateGuardianDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional({ enum: Relationship })
  @IsOptional()
  @IsEnum(Relationship)
  relationship?: Relationship;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  studentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimaryGuardian?: boolean;
}

export class UpdateGuardianDto extends PartialType(CreateGuardianDto) {}

export class GuardianQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Relationship })
  @IsOptional()
  @IsEnum(Relationship)
  relationship?: Relationship;
}

export class LinkStudentDto {
  @ApiProperty()
  @IsMongoId()
  studentId: string;

  @ApiPropertyOptional({ enum: Relationship })
  @IsOptional()
  @IsEnum(Relationship)
  relationship?: Relationship;
}
