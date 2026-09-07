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
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto, UserQueryDto } from "./dto/user.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TenantId } from "../../common/decorators/tenant.decorator";
import { Role } from "../../common/enums/roles.enum";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Create a new user (staff/parent)" })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateUserDto,
    @CurrentUser("role") role: Role,
  ) {
    return this.usersService.create(tenantId, dto, role);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "List all users with pagination & filters" })
  findAll(@TenantId() tenantId: string, @Query() query: UserQueryDto) {
    return this.usersService.findAll(tenantId, query);
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.BURSAR)
  @ApiOperation({ summary: "Get user by ID" })
  findById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.usersService.findById(id, tenantId);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Update a user" })
  update(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser("role") role: Role,
  ) {
    return this.usersService.update(id, tenantId, dto, role);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: "Deactivate a user (soft delete)" })
  deactivate(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.usersService.deactivate(id, tenantId);
  }

  @Get("role/:role")
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL)
  @ApiOperation({ summary: "Get users by role (e.g. all teachers)" })
  getByRole(@TenantId() tenantId: string, @Param("role") role: Role) {
    return this.usersService.getStaffByRole(tenantId, role);
  }
}
