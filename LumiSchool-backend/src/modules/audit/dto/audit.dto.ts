import { IsOptional, IsEnum, IsString, IsMongoId } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction } from "../schemas/audit.schema";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class AuditQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  userId?: string;
}
