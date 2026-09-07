import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { AuditRepository } from "./repositories/audit.repository";
import { AuditQueryDto } from "./dto/audit.dto";
import { AuditAction } from "./schemas/audit.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import { buildPaginationMeta } from "../../common/utils/pagination.util";

export interface AuditEvent {
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: Types.ObjectId;
  description?: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  @OnEvent("audit.log")
  async handleAuditEvent(event: AuditEvent) {
    try {
      await this.auditRepository.create(event as any);
    } catch (error) {
      this.logger.error(
        `Failed to log audit event: ${error.message}`,
        error.stack,
      );
    }
  }

  async findAll(tenantId: Types.ObjectId, query: AuditQueryDto) {
    const { data, total } = await this.auditRepository.findAll(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return ApiResponse.success({ data, meta }, "Audit logs retrieved");
  }

  async findById(tenantId: Types.ObjectId, id: string) {
    const log = await this.auditRepository.findById(tenantId, id);
    if (!log) {
      return ApiResponse.error("Audit log not found", 404);
    }
    return ApiResponse.success(log, "Audit log retrieved");
  }
}
