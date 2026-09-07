import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { TenantRepository } from "./repositories/tenant.repository";
import {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateTenantSettingsDto,
  TenantQueryDto,
} from "./dto/tenant.dto";
import { TenantDocument, Term, SmsProvider } from "./schemas/tenant.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";

@Injectable()
export class TenantsService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  /** Creates a new tenant (school) with default settings */
  async create(dto: CreateTenantDto): Promise<ApiResponse<TenantDocument>> {
    const slug = dto.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await this.tenantRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Tenant with slug "${slug}" already exists`);
    }

    const tenant = await this.tenantRepository.create({
      ...dto,
      slug,
      settings: {
        smsProvider: SmsProvider.AFRICASTALKING,
        enableRanking: false,
        enableBoarding: false,
        enableTransport: false,
        academicYear: new Date().getFullYear().toString(),
        currentTerm: Term.TERM_1,
        admissionNumberPrefix: "",
        admissionNumberNext: 1000,
      },
    });

    return ApiResponse.success(tenant, "Tenant created successfully");
  }

  /** Paginated list of tenants — SUPER_ADMIN only */
  async findAll(query: TenantQueryDto): Promise<ApiResponse<TenantDocument[]>> {
    const filter: FilterQuery<TenantDocument> = {};

    if (query.county) filter.county = query.county;
    if (query.schoolType) filter.schoolType = query.schoolType;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { slug: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.tenantRepository.findAll(
      filter,
      skip,
      limit,
      sort,
    );

    const meta = buildPaginationMeta(total, query.page || 1, query.limit || 20);
    return ApiResponse.success(data, "Tenants retrieved successfully", meta);
  }

  /** Find tenant by slug — public (used for onboarding checks) */
  async findBySlug(slug: string): Promise<ApiResponse<TenantDocument>> {
    const tenant = await this.tenantRepository.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return ApiResponse.success(tenant, "Tenant found");
  }

  /** Find tenant by ID */
  async findById(id: string): Promise<ApiResponse<TenantDocument>> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return ApiResponse.success(tenant, "Tenant found");
  }

  /** Find tenants by array of IDs */
  async findByIds(ids: string[]): Promise<TenantDocument[]> {
    return this.tenantRepository.findByIds(ids);
  }

  /** Update tenant details */
  async update(
    id: string,
    dto: UpdateTenantDto,
  ): Promise<ApiResponse<TenantDocument>> {
    const tenant = await this.tenantRepository.update(id, dto);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return ApiResponse.success(tenant, "Tenant updated successfully");
  }

  /** Update tenant settings (nested settings object) */
  async updateSettings(
    tenantId: string,
    dto: UpdateTenantSettingsDto,
  ): Promise<ApiResponse<TenantDocument>> {
    const settingsUpdate: Record<string, any> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== null && !Number.isNaN(value)) {
        settingsUpdate[key] = value;
      }
    }

    const tenant = await this.tenantRepository.updateSettings(
      tenantId,
      settingsUpdate,
    );
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return ApiResponse.success(tenant, "Tenant settings updated successfully");
  }

  /** Atomically get the current admission number and increment for next use */
  async getAndIncrementAdmissionNext(tenantId: string): Promise<number> {
    const next = await this.tenantRepository.getAndIncrementAdmissionNext(tenantId);
    if (next === null) {
      throw new NotFoundException("Tenant not found");
    }
    return next;
  }

  /** Soft delete — deactivate tenant — SUPER_ADMIN only */
  async deactivate(id: string): Promise<ApiResponse<TenantDocument>> {
    const tenant = await this.tenantRepository.deactivate(id);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return ApiResponse.success(tenant, "Tenant deactivated successfully");
  }

  /** Get tenant stats (placeholder — populated when Student/User modules exist) */
  async getStats(
    tenantId: string,
  ): Promise<
    ApiResponse<{
      totalStudents: number;
      totalStaff: number;
      activeSubscription: boolean;
    }>
  > {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    // TODO: Query actual counts from Students and Users collections
    const stats = {
      totalStudents: 0,
      totalStaff: 0,
      activeSubscription:
        tenant.isActive &&
        (!tenant.subscriptionExpiresAt ||
          tenant.subscriptionExpiresAt > new Date()),
    };

    return ApiResponse.success(stats, "Tenant stats retrieved");
  }
}
