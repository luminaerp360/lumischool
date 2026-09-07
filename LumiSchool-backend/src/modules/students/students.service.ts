import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FilterQuery, Types } from "mongoose";
import { StudentRepository } from "./repositories/student.repository";
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentQueryDto,
  PromoteStudentsDto,
  TransferStudentDto,
  BulkImportStudentDto,
} from "./dto/student.dto";
import {
  StudentDocument,
  StudentStatus,
} from "./schemas/student.schema";
import { ApiResponse } from "../../common/dto/api-response.dto";
import {
  buildPaginationMeta,
  buildMongoosePaginationOptions,
} from "../../common/utils/pagination.util";
import { AuditAction } from "../audit/schemas/audit.schema";
import { SchoolLevel } from "../../common/enums/school-level.enum";
import { TenantsService } from "../tenants/tenants.service";

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly tenantsService: TenantsService,
  ) {}

  private generateAdmissionNumber(
    prefix: string,
    nextNumber: number,
  ): string {
    const padded = String(nextNumber).padStart(4, "0");
    return prefix ? `${prefix}${padded}` : padded;
  }

  private getSchoolLevelTransition(
    currentGrade: number,
    currentLevel: SchoolLevel,
  ): { nextGrade: number; nextLevel: SchoolLevel } {
    const grade = Number(currentGrade);

    if (currentLevel === SchoolLevel.PRE_PRIMARY) {
      if (grade === 2) return { nextGrade: 1, nextLevel: SchoolLevel.PRIMARY };
      return { nextGrade: grade + 1, nextLevel: currentLevel };
    }

    if (currentLevel === SchoolLevel.PRIMARY) {
      if (grade === 6) return { nextGrade: 7, nextLevel: SchoolLevel.JSS };
      return { nextGrade: grade + 1, nextLevel: currentLevel };
    }

    if (currentLevel === SchoolLevel.JSS) {
      if (grade === 9) return { nextGrade: 10, nextLevel: SchoolLevel.SENIOR };
      return { nextGrade: grade + 1, nextLevel: currentLevel };
    }

    if (currentLevel === SchoolLevel.SENIOR) {
      if (grade === 12) return { nextGrade: 12, nextLevel: SchoolLevel.SENIOR };
      return { nextGrade: grade + 1, nextLevel: currentLevel };
    }

    return { nextGrade: grade + 1, nextLevel: currentLevel };
  }

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
        resource: "Student",
        resourceId: new Types.ObjectId(resourceId),
        description,
        previousData,
        newData,
      });
    } catch (error) {
      this.logger.error(`Failed to emit audit event: ${error.message}`);
    }
  }

  async create(
    tenantId: string,
    dto: CreateStudentDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<StudentDocument>> {
    if (!tenantId) {
      throw new BadRequestException(
        "No school context selected. Please select a school from the header before adding students.",
      );
    }

    let admissionNumber = dto.admissionNumber;

    if (!admissionNumber) {
      const next = await this.tenantsService.getAndIncrementAdmissionNext(tenantId);
      const tenant = await this.tenantsService.findById(tenantId);
      const prefix = tenant.data.settings?.admissionNumberPrefix || "";
      admissionNumber = this.generateAdmissionNumber(prefix, next);
    }

    const existing = await this.studentRepository.findByAdmissionNumber(
      tenantId,
      admissionNumber,
    );
    if (existing) {
      throw new ConflictException(
        `Student with admission number "${admissionNumber}" already exists`,
      );
    }

    if (dto.upiNumber) {
      const upiRegex = /^[A-Z]{2}\d{9}$/i;
      if (!upiRegex.test(dto.upiNumber)) {
        throw new BadRequestException(
          "UPI Number must be 2 letters followed by 9 digits (e.g., KE123456789)",
        );
      }
    }

    const student = await this.studentRepository.create({
      ...dto,
      admissionNumber,
      tenantId: tenantId as any,
      dateOfBirth: new Date(dto.dateOfBirth),
      admissionDate: dto.admissionDate
        ? new Date(dto.admissionDate)
        : new Date(),
      currentGrade: Number(dto.currentGrade),
    } as any);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.CREATE,
        (student._id as Types.ObjectId).toString(),
        `Student "${dto.firstName} ${dto.lastName}" (${admissionNumber}) registered`,
        undefined,
        { admissionNumber, grade: dto.currentGrade },
      );
    }

    return ApiResponse.success(student, "Student registered successfully");
  }

  async findAll(
    tenantId: string,
    query: StudentQueryDto,
  ): Promise<ApiResponse<StudentDocument[]>> {
    const filter: FilterQuery<StudentDocument> = { tenantId };

    if (query.level) filter.currentLevel = query.level;
    if (query.grade) filter.currentGrade = query.grade;
    if (query.classId) filter.currentClassId = query.classId;
    if (query.status) filter.status = query.status;
    if (query.gender) filter.gender = query.gender;
    if (query.boardingStatus) filter.boardingStatus = query.boardingStatus;
    if (query.cbcTrack) filter.cbcTrack = query.cbcTrack;
    if (query.specialNeedsCategory) filter.specialNeedsCategory = query.specialNeedsCategory;
    if (query.feedingProgram) filter.feedingProgram = query.feedingProgram;
    if (query.bursaryStatus) filter.bursaryStatus = query.bursaryStatus;
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: "i" } },
        { lastName: { $regex: query.search, $options: "i" } },
        { admissionNumber: { $regex: query.search, $options: "i" } },
        { upiNumber: { $regex: query.search, $options: "i" } },
        { nemisNumber: { $regex: query.search, $options: "i" } },
      ];
    }

    const { skip, limit, sort } = buildMongoosePaginationOptions(query);
    const { data, total } = await this.studentRepository.findAll(
      filter,
      skip,
      limit,
      sort,
    );
    const meta = buildPaginationMeta(total, query.page, query.limit);

    return ApiResponse.success(data, "Students retrieved successfully", meta);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<StudentDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Student not found");
    }
    const student = await this.studentRepository.findById(id);
    if (!student || student.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Student not found");
    }
    return ApiResponse.success(student, "Student retrieved successfully");
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateStudentDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<StudentDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Student not found");
    }
    const student = await this.studentRepository.findById(id);
    if (!student || student.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Student not found");
    }

    const previousData = {
      firstName: student.firstName,
      lastName: student.lastName,
      currentGrade: student.currentGrade,
      currentLevel: student.currentLevel,
      status: student.status,
    };

    const updateData: any = { ...dto };
    if (dto.dateOfBirth) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.admissionDate)
      updateData.admissionDate = new Date(dto.admissionDate);
    if (dto.currentGrade !== undefined)
      updateData.currentGrade = Number(dto.currentGrade);

    const updated = await this.studentRepository.update(id, updateData);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.UPDATE,
        id,
        `Student "${student.firstName} ${student.lastName}" updated`,
        previousData,
        updateData,
      );
    }

    return ApiResponse.success(updated, "Student updated successfully");
  }

  async promoteStudents(
    tenantId: string,
    dto: PromoteStudentsDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<{ promoted: number }>> {
    const updateData: any = {
      currentGrade: dto.toGrade,
      currentLevel: dto.toLevel,
      lastPromotionDate: new Date(),
      lastPromotionAcademicYear: dto.academicYear,
    };
    if (dto.toClassId) updateData.currentClassId = dto.toClassId;

    const promoted = await this.studentRepository.bulkUpdate(
      dto.studentIds,
      updateData,
    );

    for (const studentId of dto.studentIds) {
      const student = await this.studentRepository.findById(studentId);
      if (student) {
        await this.studentRepository.createPromotionHistory({
          tenantId: tenantId as any,
          studentId: new Types.ObjectId(studentId) as any,
          fromLevel: student.currentLevel,
          fromGrade: student.currentGrade,
          toLevel: dto.toLevel,
          toGrade: dto.toGrade,
          academicYear: dto.academicYear,
          fromClassId: student.currentClassId?.toString(),
          toClassId: dto.toClassId,
          promotedById: userId ? (new Types.ObjectId(userId) as any) : undefined,
        });

        if (userId) {
          this.emitAudit(
            tenantId,
            userId,
            userEmail || "system",
            AuditAction.UPDATE,
            studentId,
            `Student "${student.firstName} ${student.lastName}" promoted from Grade ${student.currentGrade} to Grade ${dto.toGrade}`,
          );
        }
      }
    }

    return ApiResponse.success(
      { promoted },
      `${promoted} students promoted successfully`,
    );
  }

  async autoPromoteByLevel(
    tenantId: string,
    level: SchoolLevel,
    academicYear: string,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<{ promoted: number }>> {
    const filter: FilterQuery<StudentDocument> = {
      tenantId,
      currentLevel: level,
      isActive: true,
      status: StudentStatus.ACTIVE,
    };

    const { data: students } = await this.studentRepository.findAll(
      filter,
      0,
      10000,
      { lastName: 1 },
    );

    let promotedCount = 0;
    for (const student of students) {
      const { nextGrade, nextLevel } = this.getSchoolLevelTransition(
        student.currentGrade,
        student.currentLevel,
      );

      if (nextGrade === student.currentGrade && nextLevel === student.currentLevel) {
        continue;
      }

      await this.studentRepository.update((student._id as Types.ObjectId).toString(), {
        currentGrade: nextGrade,
        currentLevel: nextLevel,
        lastPromotionDate: new Date(),
        lastPromotionAcademicYear: academicYear,
      });

      await this.studentRepository.createPromotionHistory({
        tenantId: tenantId as any,
        studentId: student._id as any,
        fromLevel: student.currentLevel,
        fromGrade: student.currentGrade,
        toLevel: nextLevel,
        toGrade: nextGrade,
        academicYear,
        promotedById: userId ? (new Types.ObjectId(userId) as any) : undefined,
      });

      promotedCount++;
    }

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.UPDATE,
        "",
        `Auto-promoted ${promotedCount} students in ${level} for ${academicYear}`,
      );
    }

    return ApiResponse.success(
      { promoted: promotedCount },
      `${promotedCount} students auto-promoted successfully`,
    );
  }

  async transferStudent(
    id: string,
    tenantId: string,
    dto: TransferStudentDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<StudentDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Student not found");
    }
    const student = await this.studentRepository.findById(id);
    if (!student || student.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Student not found");
    }

    const updated = await this.studentRepository.update(id, {
      status: StudentStatus.TRANSFERRED,
      transferLetterRef: dto.transferLetterRef,
    } as any);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.UPDATE,
        id,
        `Student "${student.firstName} ${student.lastName}" transferred to ${dto.destination}. Reason: ${dto.reason}`,
      );
    }

    return ApiResponse.success(updated, "Student transferred successfully");
  }

  async archiveStudent(
    id: string,
    tenantId: string,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<StudentDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Student not found");
    }
    const student = await this.studentRepository.findById(id);
    if (!student || student.tenantId?.toString() !== tenantId) {
      throw new NotFoundException("Student not found");
    }

    const archived = await this.studentRepository.softDelete(id);

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.DELETE,
        id,
        `Student "${student.firstName} ${student.lastName}" archived`,
      );
    }

    return ApiResponse.success(archived, "Student archived successfully");
  }

  async bulkImport(
    tenantId: string,
    dto: BulkImportStudentDto,
    userId?: string,
    userEmail?: string,
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const errors: string[] = [];
    const toInsert: any[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < dto.students.length; i++) {
      const s = dto.students[i];
      const row = i + 2;

      if (!s.admissionNumber || !s.firstName || !s.lastName || !s.dateOfBirth || !s.gender || !s.currentLevel || s.currentGrade === undefined) {
        errors.push(`Row ${row}: Missing required fields`);
        continue;
      }

      if (seen.has(s.admissionNumber)) {
        errors.push(`Row ${row}: Duplicate admission number "${s.admissionNumber}" in import data`);
        continue;
      }
      seen.add(s.admissionNumber);

      const existing = await this.studentRepository.findByAdmissionNumber(
        tenantId,
        s.admissionNumber,
      );
      if (existing) {
        errors.push(`Row ${row}: Student with admission number "${s.admissionNumber}" already exists`);
        continue;
      }

      toInsert.push({
        ...s,
        tenantId: tenantId as any,
        dateOfBirth: new Date(s.dateOfBirth),
        admissionDate: s.admissionDate ? new Date(s.admissionDate) : new Date(),
        currentGrade: Number(s.currentGrade),
      });
    }

    if (toInsert.length > 0) {
      await this.studentRepository.createMany(toInsert);
    }

    if (userId) {
      this.emitAudit(
        tenantId,
        userId,
        userEmail || "system",
        AuditAction.CREATE,
        "",
        `Bulk imported ${toInsert.length} students (${errors.length} errors)`,
      );
    }

    return ApiResponse.success(
      { imported: toInsert.length, errors },
      `Imported ${toInsert.length} students${errors.length ? ` with ${errors.length} errors` : ""}`,
    );
  }

  async findByClass(
    tenantId: string,
    classId: string,
  ): Promise<ApiResponse<StudentDocument[]>> {
    const students = await this.studentRepository.findByClass(
      tenantId,
      classId,
    );
    return ApiResponse.success(
      students,
      "Class students retrieved successfully",
    );
  }

  async findByGuardian(
    tenantId: string,
    guardianId: string,
  ): Promise<ApiResponse<StudentDocument[]>> {
    const students = await this.studentRepository.findByGuardian(
      tenantId,
      guardianId,
    );
    return ApiResponse.success(
      students,
      "Guardian students retrieved successfully",
    );
  }

  async getStats(tenantId: string): Promise<ApiResponse<any>> {
    const stats = await this.studentRepository.getDetailedStats(tenantId);
    return ApiResponse.success(stats, "Student stats retrieved");
  }

  async getPromotionHistory(
    id: string,
    tenantId: string,
  ): Promise<ApiResponse<any>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Student not found");
    }
    const history = await this.studentRepository.getPromotionHistory(
      id,
      tenantId,
    );
    return ApiResponse.success(history, "Promotion history retrieved");
  }
}
