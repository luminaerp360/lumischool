import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsMongoId,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { SchoolLevel } from "../../../common/enums/school-level.enum";
import {
  FeeCategory,
  InvoiceStatus,
  PaymentMethod,
} from "../schemas/finance.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

// ---- Fee Structure ----
export class FeeItemDto {
  @ApiProperty({ enum: FeeCategory })
  @IsEnum(FeeCategory)
  category: FeeCategory;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  isOptional?: boolean;
}

export class CreateFeeStructureDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  academicYear: string;

  @ApiProperty()
  @IsString()
  term: string;

  @ApiProperty({ enum: SchoolLevel })
  @IsEnum(SchoolLevel)
  level: SchoolLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiProperty({ type: [FeeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeItemDto)
  items: FeeItemDto[];
}

export class UpdateFeeStructureDto extends PartialType(CreateFeeStructureDto) {}

// ---- Fee Invoice ----
export class GenerateInvoicesDto {
  @ApiProperty()
  @IsMongoId()
  feeStructureId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  studentIds?: string[]; // If empty, generate for all students in that level/grade

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class ApplyDiscountDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  discount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class InvoiceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  term?: string;
}

// ---- Fee Payment ----
export class RecordPaymentDto {
  @ApiProperty()
  @IsMongoId()
  invoiceId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mpesaTransactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mpesaPhoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class PaymentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  invoiceId?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
