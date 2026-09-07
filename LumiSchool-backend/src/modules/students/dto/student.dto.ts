import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsMongoId,
  IsArray,
  IsObject,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { SchoolLevel } from "../../../common/enums/school-level.enum";
import { CbcTrack } from "../../../common/enums/cbc-track.enum";
import { SpecialNeedsCategory } from "../../../common/enums/special-needs.enum";
import {
  Gender,
  StudentStatus,
  BoardingStatus,
  FeedingProgram,
  BursaryStatus,
} from "../schemas/student.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

class MedicalInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  conditions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chronicIllness?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  physicalFitnessRef?: string;
}

class ImmunizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  polio?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  measles?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dpt?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  bcg?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  hepatitisB?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  hpv?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  covid19?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  yellowFever?: { status: boolean; date?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  tetanus?: { status: boolean; date?: string };
}

class HouseholdInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  siblingCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  parentNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOrphan?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPartialOrphan?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSingleParent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentOccupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentIncomeBracket?: string;
}

class TransportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  needsTransport?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickupPoint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  transportFee?: number;
}

class ExtracurricularDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedDate?: string;
}

export class CreateStudentDto {
  @ApiPropertyOptional({ description: "Leave empty to auto-generate from tenant format" })
  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  upiNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nemisNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nhifNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthCertificateNumber?: string;

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
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: SchoolLevel })
  @IsEnum(SchoolLevel)
  currentLevel: SchoolLevel;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  currentGrade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  currentClassId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  currentStreamId?: string;

  @ApiPropertyOptional({ enum: CbcTrack })
  @IsOptional()
  @IsEnum(CbcTrack)
  cbcTrack?: CbcTrack;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subjectIds?: string[];

  @ApiPropertyOptional({ enum: BoardingStatus })
  @IsOptional()
  @IsEnum(BoardingStatus)
  boardingStatus?: BoardingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousSchoolGrade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousSchoolLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transferLetterRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subCounty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  constituency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ type: MedicalInfoDto })
  @IsOptional()
  @IsObject()
  medicalInfo?: MedicalInfoDto;

  @ApiPropertyOptional({ type: ImmunizationDto })
  @IsOptional()
  @IsObject()
  immunization?: ImmunizationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  guardianIds?: string[];

  @ApiPropertyOptional({ enum: SpecialNeedsCategory })
  @IsOptional()
  @IsEnum(SpecialNeedsCategory)
  specialNeedsCategory?: SpecialNeedsCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialNeeds?: string;

  @ApiPropertyOptional({ type: HouseholdInfoDto })
  @IsOptional()
  @IsObject()
  householdInfo?: HouseholdInfoDto;

  @ApiPropertyOptional({ enum: FeedingProgram })
  @IsOptional()
  @IsEnum(FeedingProgram)
  feedingProgram?: FeedingProgram;

  @ApiPropertyOptional({ enum: BursaryStatus })
  @IsOptional()
  @IsEnum(BursaryStatus)
  bursaryStatus?: BursaryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bursarySource?: string;

  @ApiPropertyOptional({ type: TransportDto })
  @IsOptional()
  @IsObject()
  transport?: TransportDto;

  @ApiPropertyOptional({ type: [ExtracurricularDto] })
  @IsOptional()
  @IsArray()
  extracurricular?: ExtracurricularDto[];
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}

export class StudentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SchoolLevel })
  @IsOptional()
  @IsEnum(SchoolLevel)
  level?: SchoolLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: BoardingStatus })
  @IsOptional()
  @IsEnum(BoardingStatus)
  boardingStatus?: BoardingStatus;

  @ApiPropertyOptional({ enum: CbcTrack })
  @IsOptional()
  @IsEnum(CbcTrack)
  cbcTrack?: CbcTrack;

  @ApiPropertyOptional({ enum: SpecialNeedsCategory })
  @IsOptional()
  @IsEnum(SpecialNeedsCategory)
  specialNeedsCategory?: SpecialNeedsCategory;

  @ApiPropertyOptional({ enum: FeedingProgram })
  @IsOptional()
  @IsEnum(FeedingProgram)
  feedingProgram?: FeedingProgram;

  @ApiPropertyOptional({ enum: BursaryStatus })
  @IsOptional()
  @IsEnum(BursaryStatus)
  bursaryStatus?: BursaryStatus;
}

export class PromoteStudentsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  studentIds: string[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  toGrade: number;

  @ApiProperty({ enum: SchoolLevel })
  @IsEnum(SchoolLevel)
  toLevel: SchoolLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  toClassId?: string;

  @ApiProperty()
  @IsString()
  academicYear: string;
}

export class TransferStudentDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transferLetterRef?: string;
}

export class BulkImportStudentDto {
  @ApiProperty({ type: [CreateStudentDto] })
  @IsArray()
  students: CreateStudentDto[];
}
