import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FilterQuery, Types } from "mongoose";
import { ClassRepository } from "./repositories/class.repository";
import {
  CreateClassDto,
  UpdateClassDto,
  ClassQueryDto,
  CreateStreamDto,
  UpdateStreamDto,
  BatchCreateClassesDto,
  CloneClassesDto,
} from "./dto/class.dto";
import {
  Class,
  ClassDocument,
  StreamDocument,
  GRADE_RANGES,
} from "./schemas/class.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";
import { AuditAction } from "../audit/schemas/audit.schema";
import { SchoolLevel } from "../../common/enums/school-level.enum";

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    private readonly classRepository: ClassRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private emitAudit(
    tenantId: string,
    userId: string,
    userEmail: string,
    action: AuditAction,
    resourceId: string,
    description: string,
    previousData?: Record<string, any>,
    newData?: Record<string, any>,
  ) {
    try {
      this.eventEmitter.emit("audit.log", {
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
        userEmail,
        action,
        resource: "Class",
        resourceId: new Types.ObjectId(resourceId),
        description,
        previousData,
        newData,
      });
    } catch (error) {
      this.logger.error(`Failed to emit audit event: ${error.message}`);
    }
  }

  validateGradeForLevel(level: SchoolLevel, grade: number): void {
    const [min, max] = GRADE_RANGES[level];
    if (grade < min || grade > max) {
      throw new BadRequestException(
        `Grade ${grade} is not valid for ${level}. Valid range: ${min}-${max}`,
      );
    }
  }

  async createClass(
    tenantId: string,
    dto: CreateClassDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<ClassDocument>> {
    this.validateGradeForLevel(dto.level, dto.grade);

    const cls = await this.classRepository.createClass({
      ...dto,
      tenantId: tenantId as any,
    } as any);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.CREATE,
        (cls._id as Types.ObjectId).toString(),
        `Class "${dto.name}" (${dto.level} Grade ${dto.grade}) created for ${dto.academicYear}`,
      );
    }

    return ApiResponse.success(cls, "Class created successfully");
  }

  async batchCreateClasses(
    tenantId: string,
    dto: BatchCreateClassesDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<{ created: number; classes: ClassDocument[] }>> {
    const [min, max] = GRADE_RANGES[dto.level];
    const classes: Partial<Class>[] = [];

    for (let grade = min; grade <= max; grade++) {
      classes.push({
        tenantId: tenantId as any,
        name: `Grade ${grade}`,
        level: dto.level,
        grade,
        academicYear: dto.academicYear,
        capacity: dto.capacity || 45,
      });
    }

    const created = await this.classRepository.createClasses(classes);

    if (dto.createStreams && dto.streamNames?.length) {
      for (const cls of created) {
        const streams: Partial<StreamDocument>[] = dto.streamNames.map(
          (name) => ({
            tenantId: tenantId as any,
            classId: (cls._id as Types.ObjectId) as any,
            name,
            capacity: dto.capacity || 45,
          }),
        );
        await (this.classRepository as any).createStreams(streams);
      }
    }

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.CREATE,
        "",
        `Batch created ${created.length} classes for ${dto.level} (${dto.academicYear})`,
      );
    }

    return ApiResponse.success(
      { created: created.length, classes: created },
      `${created.length} classes created for ${dto.level}`,
    );
  }

  async cloneClasses(
    tenantId: string,
    dto: CloneClassesDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<{ cloned: number }>> {
    const sourceYear = (Number(dto.targetAcademicYear) - 1).toString();
    const sourceClasses = await this.classRepository.findAllClassesNoPagination(
      { tenantId, academicYear: sourceYear, isActive: true },
    );

    if (sourceClasses.length === 0) {
      throw new BadRequestException(
        `No classes found for academic year ${sourceYear} to clone from`,
      );
    }

    const newClasses: Partial<Class>[] = sourceClasses.map((c) => ({
      tenantId: tenantId as any,
      name: c.name,
      level: c.level,
      grade: c.grade,
      academicYear: dto.targetAcademicYear,
      capacity: c.capacity,
      category: c.category,
      isExamCenter: c.isExamCenter,
      cbcTrack: c.cbcTrack,
      room: c.room,
      block: c.block,
    }));

    const created = await this.classRepository.createClasses(newClasses);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.CREATE,
        "",
        `Cloned ${created.length} classes from ${sourceYear} to ${dto.targetAcademicYear}`,
      );
    }

    return ApiResponse.success(
      { cloned: created.length },
      `${created.length} classes cloned to ${dto.targetAcademicYear}`,
    );
  }

  async findAllClasses(
    tenantId: string,
    query: ClassQueryDto,
  ): Promise<ApiResponse<ClassDocument[]>> {
    const filter: FilterQuery<ClassDocument> = { tenantId, isActive: true };

    if (query.level) filter.level = query.level;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.grade) filter.grade = query.grade;
    if (query.classTeacherId) filter.classTeacherId = query.classTeacherId;
    if (query.category) filter.category = query.category;
    if (query.cbcTrack) filter.cbcTrack = query.cbcTrack;
    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.classRepository.findAllClasses(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Classes retrieved successfully", meta);
  }

  async findClassById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<ClassDocument>> {
    const cls = await this.classRepository.findClassById(id);
    if (!cls || cls.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Class not found");
    }
    return ApiResponse.success(cls, "Class retrieved successfully");
  }

  async getClassStats(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<any>> {
    const cls = await this.classRepository.findClassById(id);
    if (!cls || cls.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Class not found");
    }

    const stats = await this.classRepository.getClassStats(tenantId, id);
    return ApiResponse.success(
      { ...stats, capacity: cls.capacity, room: cls.room },
      "Class stats retrieved",
    );
  }

  async updateClass(
    id: string,
    tenantId: string,
    dto: UpdateClassDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<ClassDocument>> {
    const cls = await this.classRepository.findClassById(id);
    if (!cls || cls.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Class not found");
    }

    const level = dto.level ?? cls.level;
    const grade = dto.grade ?? cls.grade;
    if (dto.level !== undefined || dto.grade !== undefined) {
      this.validateGradeForLevel(level, grade);
    }

    const updated = await this.classRepository.updateClass(id, dto as any);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.UPDATE,
        id,
        `Class "${cls.name}" updated`,
        { name: cls.name, level: cls.level, grade: cls.grade },
        { name: updated?.name, level: updated?.level, grade: updated?.grade },
      );
    }

    return ApiResponse.success(updated, "Class updated successfully");
  }

  async deleteClass(
    id: string,
    tenantId: string,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<ClassDocument>> {
    const cls = await this.classRepository.findClassById(id);
    if (!cls || cls.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Class not found");
    }

    const archived = await this.classRepository.softDeleteClass(id);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.DELETE,
        id,
        `Class "${cls.name}" archived`,
      );
    }

    return ApiResponse.success(archived, "Class archived successfully");
  }

  async createStream(
    tenantId: string,
    dto: CreateStreamDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<StreamDocument>> {
    const cls = await this.classRepository.findClassById(dto.classId);
    if (!cls || cls.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Class not found");
    }

    const stream = await this.classRepository.createStream({
      ...dto,
      tenantId: tenantId as any,
      classId: dto.classId as any,
    } as any);

    await this.classRepository.addStreamToClass(
      dto.classId,
      (stream as any)._id.toString(),
    );

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.CREATE,
        (stream._id as Types.ObjectId).toString(),
        `Stream "${dto.name}" created in class "${cls.name}"`,
      );
    }

    return ApiResponse.success(stream, "Stream created successfully");
  }

  async findStreamById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<StreamDocument>> {
    const stream = await this.classRepository.findStreamById(id);
    if (!stream || stream.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Stream not found");
    }
    return ApiResponse.success(stream, "Stream retrieved");
  }

  async findStreamsByClass(
    tenantId: string,
    classId: string,
  ): Promise<ApiResponse<StreamDocument[]>> {
    const streams = await this.classRepository.findStreamsByClass(
      tenantId,
      classId,
    );
    return ApiResponse.success(streams, "Streams retrieved successfully");
  }

  async updateStream(
    id: string,
    tenantId: string,
    dto: UpdateStreamDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<StreamDocument>> {
    const stream = await this.classRepository.findStreamById(id);
    if (!stream || stream.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Stream not found");
    }

    const updated = await this.classRepository.updateStream(id, dto as any);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.UPDATE,
        id,
        `Stream "${stream.name}" updated`,
      );
    }

    return ApiResponse.success(updated, "Stream updated successfully");
  }

  async deleteStream(
    id: string,
    tenantId: string,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<null>> {
    const stream = await this.classRepository.findStreamById(id);
    if (!stream || stream.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Stream not found");
    }

    await this.classRepository.softDeleteStream(id);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.DELETE,
        id,
        `Stream "${stream.name}" deactivated`,
      );
    }

    return ApiResponse.success(null, "Stream deactivated successfully");
  }
}
