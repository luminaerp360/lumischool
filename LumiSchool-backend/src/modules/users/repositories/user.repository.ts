import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select("-passwordHash -refreshTokenHash")
      .exec();
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(
    tenantId: string,
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ tenantId, email }).exec();
  }

  async findAll(
    filter: FilterQuery<UserDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: UserDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select("-passwordHash -refreshTokenHash")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .select("-passwordHash -refreshTokenHash")
      .exec();
  }

  async deactivate(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .select("-passwordHash -refreshTokenHash")
      .exec();
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.userModel.countDocuments({ tenantId }).exec();
  }

  async countByTenantAndRole(tenantId: string, role: string): Promise<number> {
    return this.userModel.countDocuments({ tenantId, role }).exec();
  }
}
