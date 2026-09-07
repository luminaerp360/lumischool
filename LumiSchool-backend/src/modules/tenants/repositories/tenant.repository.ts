import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { Tenant, TenantDocument } from "../schemas/tenant.schema";

@Injectable()
export class TenantRepository {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async create(data: Partial<Tenant>): Promise<TenantDocument> {
    return this.tenantModel.create(data);
  }

  async findById(id: string): Promise<TenantDocument | null> {
    return this.tenantModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<TenantDocument | null> {
    return this.tenantModel.findOne({ slug }).exec();
  }

  async findByIds(ids: string[]): Promise<TenantDocument[]> {
    return this.tenantModel.find({ _id: { $in: ids }, isActive: true }).exec();
  }

  async findAll(
    filter: FilterQuery<TenantDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: TenantDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.tenantModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.tenantModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async update(
    id: string,
    data: Partial<Tenant>,
  ): Promise<TenantDocument | null> {
    return this.tenantModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  async updateSettings(
    id: string,
    settings: Record<string, any>,
  ): Promise<TenantDocument | null> {
    const updateObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(settings)) {
      updateObj[`settings.${key}`] = value;
    }
    return this.tenantModel
      .findByIdAndUpdate(id, { $set: updateObj }, { new: true })
      .exec();
  }

  async getAndIncrementAdmissionNext(
    id: string,
  ): Promise<number | null> {
    const result = await this.tenantModel
      .findOneAndUpdate(
        { _id: id },
        { $inc: { "settings.admissionNumberNext": 1 } },
        {
          new: false,
          projection: { "settings.admissionNumberNext": 1 },
        },
      )
      .exec();

    if (!result) return null;
    return result.settings?.admissionNumberNext ?? 0;
  }

  async deactivate(id: string): Promise<TenantDocument | null> {
    return this.tenantModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .exec();
  }
}
