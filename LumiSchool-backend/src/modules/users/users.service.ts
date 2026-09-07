import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import * as bcrypt from "bcrypt";
import { UserRepository } from "./repositories/user.repository";
import { CreateUserDto, UpdateUserDto, UserQueryDto } from "./dto/user.dto";
import { UserDocument } from "./schemas/user.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";
import { Role } from "../../common/enums/roles.enum";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(
    tenantId: string,
    dto: CreateUserDto,
    currentUserRole: Role,
  ): Promise<ApiResponse<UserDocument>> {
    // Only SUPER_ADMIN can create SCHOOL_ADMIN; SCHOOL_ADMIN/PRINCIPAL can create staff
    this.validateRoleAssignment(currentUserRole, dto.role);

    const existing = await this.userRepository.findByEmail(tenantId, dto.email);
    if (existing) {
      throw new ConflictException(
        "User with this email already exists in this school",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const { password, ...rest } = dto;

    const user = await this.userRepository.create({
      ...rest,
      tenantId: tenantId as any,
      passwordHash,
    });

    return ApiResponse.success(user, "User created successfully");
  }

  async findAll(
    tenantId: string,
    query: UserQueryDto,
  ): Promise<ApiResponse<UserDocument[]>> {
    const filter: FilterQuery<UserDocument> = { tenantId };

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: "i" } },
        { lastName: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.userRepository.findAll(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Users retrieved successfully", meta);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<UserDocument>> {
    const user = await this.userRepository.findById(id);
    if (!user || user.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("User not found");
    }
    return ApiResponse.success(user, "User retrieved successfully");
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateUserDto,
    currentUserRole: Role,
  ): Promise<ApiResponse<UserDocument>> {
    const user = await this.userRepository.findById(id);
    if (!user || user.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("User not found");
    }

    if (dto.role) {
      this.validateRoleAssignment(currentUserRole, dto.role);
    }

    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 12);
      delete updateData.password;
    }

    const updated = await this.userRepository.update(id, updateData);
    return ApiResponse.success(updated, "User updated successfully");
  }

  async deactivate(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<UserDocument>> {
    const user = await this.userRepository.findById(id);
    if (!user || user.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("User not found");
    }

    const deactivated = await this.userRepository.deactivate(id);
    return ApiResponse.success(deactivated, "User deactivated successfully");
  }

  async getStaffByRole(
    tenantId: string,
    role: Role,
  ): Promise<ApiResponse<UserDocument[]>> {
    const { data } = await this.userRepository.findAll(
      { tenantId, role, isActive: true },
      0,
      1000,
      { firstName: 1 },
    );
    return ApiResponse.success(data, `${role} users retrieved successfully`);
  }

  private validateRoleAssignment(currentRole: Role, targetRole: Role): void {
    const roleHierarchy: Record<string, string[]> = {
      [Role.SUPER_ADMIN]: Object.values(Role),
      [Role.SCHOOL_ADMIN]: [
        Role.PRINCIPAL,
        Role.BURSAR,
        Role.TEACHER,
        Role.PARENT,
        Role.STUDENT,
      ],
      [Role.PRINCIPAL]: [Role.TEACHER, Role.PARENT, Role.STUDENT],
    };

    const allowedRoles = roleHierarchy[currentRole] || [];
    if (!allowedRoles.includes(targetRole)) {
      throw new ForbiddenException(
        `Role ${currentRole} cannot assign role ${targetRole}`,
      );
    }
  }
}
