import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsMongoId,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { SchoolLevel } from "../../../common/enums/school-level.enum";
import { CbcTrack } from "../../../common/enums/cbc-track.enum";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import {
  ClassCategory,
  ClassStatus,
  GRADE_RANGES,
} from "../schemas/class.schema";

export class CreateClassDto {
  @ApiProperty({ example: "Grade 1 East" })
  @IsString()
  name: string;

  @ApiProperty({ enum: SchoolLevel })
  @IsEnum(SchoolLevel)
  level: SchoolLevel;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  grade: number;

  @ApiProperty({ example: "2026" })
  @IsString()
  academicYear: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classTeacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  assistantTeacherId?: string;

  @ApiPropertyOptional({ default: 45 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: "Room 5A" })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional({ example: "New Block" })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ enum: ClassCategory, default: ClassCategory.REGULAR })
  @IsOptional()
  @IsEnum(ClassCategory)
  category?: ClassCategory;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isExamCenter?: boolean;

  @ApiPropertyOptional({ enum: CbcTrack })
  @IsOptional()
  @IsEnum(CbcTrack)
  cbcTrack?: CbcTrack;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMultiGrade?: boolean;
}

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @ApiPropertyOptional({ enum: ClassStatus })
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}

export class ClassQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SchoolLevel })
  @IsOptional()
  @IsEnum(SchoolLevel)
  level?: SchoolLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classTeacherId?: string;

  @ApiPropertyOptional({ enum: ClassCategory })
  @IsOptional()
  @IsEnum(ClassCategory)
  category?: ClassCategory;

  @ApiPropertyOptional({ enum: CbcTrack })
  @IsOptional()
  @IsEnum(CbcTrack)
  cbcTrack?: CbcTrack;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateStreamDto {
  @ApiProperty()
  @IsMongoId()
  classId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  streamTeacherId?: string;

  @ApiPropertyOptional({ default: 45 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: "Room 5A" })
  @IsOptional()
  @IsString()
  room?: string;
}

export class UpdateStreamDto extends PartialType(CreateStreamDto) {}

export class BatchCreateClassesDto {
  @ApiProperty({ enum: SchoolLevel })
  @IsEnum(SchoolLevel)
  level: SchoolLevel;

  @ApiProperty({ example: "2026" })
  @IsString()
  academicYear: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  createStreams?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  streamNames?: string[];

  @ApiPropertyOptional({ default: 45 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;
}

export class CloneClassesDto {
  @ApiProperty({ example: "2027" })
  @IsString()
  targetAcademicYear: string;
}
