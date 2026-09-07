import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLog, AuditLogDocument } from "../schemas/audit.schema";
import { buildMongoosePaginationOptions } from "../../../common/utils/pagination.util";

@Injectable()
export class AuditRepository {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async create(data: Partial<AuditLog>): Promise<AuditLogDocument> {
    return this.auditModel.create(data);
  }

  async findAll(
    tenantId: Types.ObjectId,
    query: any,
  ): Promise<{ data: AuditLogDocument[]; total: number }> {
    const filter: any = { tenantId };
    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
    if (query.userId) filter.userId = query.userId;

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .populate("userId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async findById(
    tenantId: Types.ObjectId,
    id: string,
  ): Promise<AuditLogDocument | null> {
    return this.auditModel
      .findOne({ _id: id, tenantId })
      .populate("userId", "firstName lastName email")
      .exec();
  }
}
