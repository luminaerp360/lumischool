import { Injectable, NotFoundException } from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { GuardianRepository } from "./repositories/guardian.repository";
import {
  CreateGuardianDto,
  UpdateGuardianDto,
  GuardianQueryDto,
  LinkStudentDto,
} from "./dto/guardian.dto";
import { GuardianDocument } from "./schemas/guardian.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";

@Injectable()
export class GuardiansService {
  constructor(private readonly guardianRepository: GuardianRepository) {}

  async create(
    tenantId: string,
    dto: CreateGuardianDto,
  ): Promise<ApiResponse<GuardianDocument>> {
    const guardian = await this.guardianRepository.create({
      ...dto,
      tenantId: tenantId as any,
    } as any);
    return ApiResponse.success(guardian, "Guardian created successfully");
  }

  async findAll(
    tenantId: string,
    query: GuardianQueryDto,
  ): Promise<ApiResponse<GuardianDocument[]>> {
    const filter: FilterQuery<GuardianDocument> = { tenantId };

    if (query.relationship) filter.relationship = query.relationship;
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: "i" } },
        { lastName: { $regex: query.search, $options: "i" } },
        { phone: { $regex: query.search, $options: "i" } },
        { idNumber: { $regex: query.search, $options: "i" } },
      ];
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.guardianRepository.findAll(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Guardians retrieved successfully", meta);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<GuardianDocument>> {
    const guardian = await this.guardianRepository.findById(id);
    if (!guardian || guardian.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Guardian not found");
    }
    return ApiResponse.success(guardian, "Guardian retrieved successfully");
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateGuardianDto,
  ): Promise<ApiResponse<GuardianDocument>> {
    const guardian = await this.guardianRepository.findById(id);
    if (!guardian || guardian.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Guardian not found");
    }

    const updated = await this.guardianRepository.update(id, dto as any);
    return ApiResponse.success(updated, "Guardian updated successfully");
  }

  async linkStudent(
    id: string,
    tenantId: string,
    dto: LinkStudentDto,
  ): Promise<ApiResponse<GuardianDocument>> {
    const guardian = await this.guardianRepository.findById(id);
    if (!guardian || guardian.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Guardian not found");
    }

    const updated = await this.guardianRepository.addStudent(id, dto.studentId);
    return ApiResponse.success(updated, "Student linked to guardian");
  }

  async unlinkStudent(
    id: string,
    tenantId: string,
    studentId: string,
  ): Promise<ApiResponse<GuardianDocument>> {
    const guardian = await this.guardianRepository.findById(id);
    if (!guardian || guardian.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Guardian not found");
    }

    const updated = await this.guardianRepository.removeStudent(id, studentId);
    return ApiResponse.success(updated, "Student unlinked from guardian");
  }

  async findByStudent(
    tenantId: string,
    studentId: string,
  ): Promise<ApiResponse<GuardianDocument[]>> {
    const guardians = await this.guardianRepository.findByStudent(
      tenantId,
      studentId,
    );
    return ApiResponse.success(guardians, "Student guardians retrieved");
  }
}
