import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { AcademicRepository } from "./repositories/academic.repository";
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectQueryDto,
  CreateSubjectAssignmentDto,
  UpdateSubjectAssignmentDto,
} from "./dto/academic.dto";
import {
  SubjectDocument,
  SubjectAssignmentDocument,
} from "./schemas/subject.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";

@Injectable()
export class AcademicsService {
  constructor(private readonly academicRepository: AcademicRepository) {}

  // ---- Subjects ----
  async createSubject(
    tenantId: string,
    dto: CreateSubjectDto,
  ): Promise<ApiResponse<SubjectDocument>> {
    const existing = await this.academicRepository.findSubjectByCode(
      tenantId,
      dto.code.toUpperCase(),
    );
    if (existing) {
      throw new ConflictException(
        `Subject with code "${dto.code}" already exists`,
      );
    }

    const subject = await this.academicRepository.createSubject({
      ...dto,
      code: dto.code.toUpperCase(),
      tenantId: tenantId as any,
    });
    return ApiResponse.success(subject, "Subject created successfully");
  }

  async findAllSubjects(
    tenantId: string,
    query: SubjectQueryDto,
  ): Promise<ApiResponse<SubjectDocument[]>> {
    const filter: FilterQuery<SubjectDocument> = { tenantId, isActive: true };

    if (query.category) filter.category = query.category;
    if (query.level) filter.applicableLevels = query.level;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { code: { $regex: query.search, $options: "i" } },
      ];
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.academicRepository.findAllSubjects(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Subjects retrieved successfully", meta);
  }

  async findSubjectById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<SubjectDocument>> {
    const subject = await this.academicRepository.findSubjectById(id);
    if (!subject || subject.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Subject not found");
    }
    return ApiResponse.success(subject, "Subject retrieved successfully");
  }

  async updateSubject(
    id: string,
    tenantId: string,
    dto: UpdateSubjectDto,
  ): Promise<ApiResponse<SubjectDocument>> {
    const subject = await this.academicRepository.findSubjectById(id);
    if (!subject || subject.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Subject not found");
    }

    const updateData = { ...dto };
    if (dto.code) (updateData as any).code = dto.code.toUpperCase();

    const updated = await this.academicRepository.updateSubject(id, updateData);
    return ApiResponse.success(updated, "Subject updated successfully");
  }

  // ---- Assignments ----
  async findAllAssignments(
    tenantId: string,
    filter: { classId?: string; teacherId?: string; academicYear?: string },
  ): Promise<ApiResponse<SubjectAssignmentDocument[]>> {
    const assignments = await this.academicRepository.findAllAssignments(
      tenantId,
      filter,
    );
    return ApiResponse.success(assignments, "Assignments retrieved");
  }

  async createAssignment(
    tenantId: string,
    dto: CreateSubjectAssignmentDto,
  ): Promise<ApiResponse<SubjectAssignmentDocument>> {
    const assignment = await this.academicRepository.createAssignment({
      ...dto,
      tenantId: tenantId as any,
      subjectId: dto.subjectId as any,
      teacherId: dto.teacherId as any,
      classId: dto.classId as any,
      streamId: dto.streamId as any,
    });
    return ApiResponse.success(assignment, "Subject assignment created");
  }

  async findAssignmentsByClass(
    tenantId: string,
    classId: string,
    academicYear: string,
  ): Promise<ApiResponse<SubjectAssignmentDocument[]>> {
    const assignments = await this.academicRepository.findAssignmentsByClass(
      tenantId,
      classId,
      academicYear,
    );
    return ApiResponse.success(assignments, "Class assignments retrieved");
  }

  async findAssignmentsByTeacher(
    tenantId: string,
    teacherId: string,
    academicYear: string,
  ): Promise<ApiResponse<SubjectAssignmentDocument[]>> {
    const assignments = await this.academicRepository.findAssignmentsByTeacher(
      tenantId,
      teacherId,
      academicYear,
    );
    return ApiResponse.success(assignments, "Teacher assignments retrieved");
  }

  async updateAssignment(
    id: string,
    tenantId: string,
    dto: UpdateSubjectAssignmentDto,
  ): Promise<ApiResponse<SubjectAssignmentDocument>> {
    const assignment = await this.academicRepository.findAssignmentById(id);
    if (!assignment || assignment.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Assignment not found");
    }

    const updated = await this.academicRepository.updateAssignment(
      id,
      dto as any,
    );
    return ApiResponse.success(updated, "Assignment updated successfully");
  }

  async deleteAssignment(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<null>> {
    const assignment = await this.academicRepository.findAssignmentById(id);
    if (!assignment || assignment.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Assignment not found");
    }

    await this.academicRepository.deleteAssignment(id);
    return ApiResponse.success(null, "Assignment deactivated");
  }
}
