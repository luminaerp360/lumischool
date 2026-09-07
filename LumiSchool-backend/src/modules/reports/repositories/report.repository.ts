import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  GeneratedReport,
  GeneratedReportDocument,
  ReportStatus,
} from "../schemas/report.schema";
import { buildMongoosePaginationOptions } from "../../../common/utils/pagination.util";

@Injectable()
export class ReportRepository {
  constructor(
    @InjectModel(GeneratedReport.name)
    private reportModel: Model<GeneratedReportDocument>,
  ) {}

  async create(
    data: Partial<GeneratedReport>,
  ): Promise<GeneratedReportDocument> {
    return this.reportModel.create(data);
  }

  async findById(
    tenantId: Types.ObjectId,
    id: string,
  ): Promise<GeneratedReportDocument | null> {
    return this.reportModel
      .findOne({ _id: id, tenantId })
      .populate("requestedById", "firstName lastName")
      .exec();
  }

  async findAll(
    tenantId: Types.ObjectId,
    query: any,
  ): Promise<{ data: GeneratedReportDocument[]; total: number }> {
    const filter: any = { tenantId };
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .populate("requestedById", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reportModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    extra?: Partial<GeneratedReport>,
  ): Promise<GeneratedReportDocument | null> {
    return this.reportModel
      .findByIdAndUpdate(id, { $set: { status, ...extra } }, { new: true })
      .exec();
  }

  async delete(
    tenantId: Types.ObjectId,
    id: string,
  ): Promise<GeneratedReportDocument | null> {
    return this.reportModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }
}
