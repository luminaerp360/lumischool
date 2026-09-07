import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsMongoId,
  IsArray,
  IsDateString,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { ExamType, GradingScale } from "../schemas/exam.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ExamType })
  @IsEnum(ExamType)
  type: ExamType;

  @ApiProperty()
  @IsString()
  academicYear: string;

  @ApiProperty()
  @IsString()
  term: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  classIds: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subjectIds?: string[];

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalMarks?: number;
}

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class ExamQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ExamType })
  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;
}

export class SingleResultDto {
  @ApiProperty()
  @IsMongoId()
  studentId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  marksObtained: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherComments?: string;
}

export class SubmitResultsDto {
  @ApiProperty()
  @IsMongoId()
  examId: string;

  @ApiProperty()
  @IsMongoId()
  subjectId: string;

  @ApiProperty()
  @IsMongoId()
  classId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalMarks: number;

  @ApiProperty({ type: [SingleResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleResultDto)
  results: SingleResultDto[];
}

export class ResultQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  examId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;
}
