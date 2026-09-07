import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsMongoId,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { SchoolLevel } from "../../../common/enums/school-level.enum";
import { SubjectCategory } from "../schemas/subject.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ enum: SubjectCategory })
  @IsOptional()
  @IsEnum(SubjectCategory)
  category?: SubjectCategory;

  @ApiPropertyOptional({ enum: SchoolLevel, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SchoolLevel, { each: true })
  applicableLevels?: SchoolLevel[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}

export class SubjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SubjectCategory })
  @IsOptional()
  @IsEnum(SubjectCategory)
  category?: SubjectCategory;

  @ApiPropertyOptional({ enum: SchoolLevel })
  @IsOptional()
  @IsEnum(SchoolLevel)
  level?: SchoolLevel;
}

export class CreateSubjectAssignmentDto {
  @ApiProperty()
  @IsMongoId()
  subjectId: string;

  @ApiProperty()
  @IsMongoId()
  teacherId: string;

  @ApiProperty()
  @IsMongoId()
  classId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  streamId?: string;

  @ApiProperty()
  @IsString()
  academicYear: string;
}

export class UpdateSubjectAssignmentDto extends PartialType(
  CreateSubjectAssignmentDto,
) {}
