import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // For SUPER_ADMIN (tenantId is null in JWT), fall back to x-tenant-id header
    return request.user?.tenantId || request.headers["x-tenant-id"] || null;
  },
);

// Alias for backward compatibility
export const CurrentTenant = TenantId;
