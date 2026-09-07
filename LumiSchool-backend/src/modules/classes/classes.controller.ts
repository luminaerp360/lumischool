import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ClassesService } from "./classes.service";
import {
  CreateClassDto,
  UpdateClassDto,
  ClassQueryDto,
  CreateStreamDto,
  UpdateStreamDto,
  BatchCreateClassesDto,
  CloneClassesDto,
} from "./dto/class.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../common/enums/roles.enum";

@ApiTags("Classes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("classes")
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create a new class" })
  createClass(
    @TenantId() tenantId: string,
    @Body() dto: CreateClassDto,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.createClass(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Post("batch")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Batch create all classes for a level" })
  batchCreate(
    @TenantId() tenantId: string,
    @Body() dto: BatchCreateClassesDto,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.batchCreateClasses(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Post("clone")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Clone classes to a new academic year" })
  cloneClasses(
    @TenantId() tenantId: string,
    @Body() dto: CloneClassesDto,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.cloneClasses(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.BURSAR)
  @ApiOperation({ summary: "List all classes with filters" })
  findAllClasses(@TenantId() tenantId: string, @Query() query: ClassQueryDto) {
    return this.classesService.findAllClasses(tenantId, query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.BURSAR)
  @ApiOperation({ summary: "Get class by ID" })
  findClassById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.classesService.findClassById(id, tenantId);
  }

  @Get(":id/stats")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get class statistics" })
  getClassStats(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.classesService.getClassStats(id, tenantId);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update a class" })
  updateClass(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateClassDto,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.updateClass(
      id,
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Archive (soft delete) a class" })
  deleteClass(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.deleteClass(
      id,
      tenantId,
      user?.userId,
      user?.email,
    );
  }

  @Post("streams")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create a new stream within a class" })
  createStream(
    @TenantId() tenantId: string,
    @Body() dto: CreateStreamDto,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.createStream(
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Get("streams/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: "Get a single stream by ID" })
  findStreamById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.classesService.findStreamById(id, tenantId);
  }

  @Get(":classId/streams")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.BURSAR)
  @ApiOperation({ summary: "Get all streams for a class" })
  findStreamsByClass(
    @TenantId() tenantId: string,
    @Param("classId") classId: string,
  ) {
    return this.classesService.findStreamsByClass(tenantId, classId);
  }

  @Patch("streams/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update a stream" })
  updateStream(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateStreamDto,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.updateStream(
      id,
      tenantId,
      dto,
      user?.userId,
      user?.email,
    );
  }

  @Delete("streams/:id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Deactivate a stream" })
  deleteStream(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user?: any,
  ) {
    return this.classesService.deleteStream(
      id,
      tenantId,
      user?.userId,
      user?.email,
    );
  }
}
