import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SKIP_AUDIT_KEY } from "../decorators/skip-audit.decorator";

export interface AuditLogEvent {
  tenantId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const METHOD_ACTION_MAP: Record<string, string> = {
  POST: "CREATE",
  PATCH: "UPDATE",
  PUT: "UPDATE",
  DELETE: "DELETE",
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipAudit = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const action = METHOD_ACTION_MAP[method];

    if (!action) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseData) => {
        const user = request.user;
        if (!user) return;

        const controllerName = context
          .getClass()
          .name.replace("Controller", "");
        const entityId =
          request.params?.id || responseData?.data?._id?.toString() || "";

        const event: AuditLogEvent = {
          tenantId: user.tenantId || "",
          userId: user.sub || user._id,
          userEmail: user.email || "",
          userRole: user.role || "",
          action,
          entity: controllerName,
          entityId,
          newValue:
            action === "CREATE" || action === "UPDATE"
              ? request.body
              : undefined,
          ipAddress: request.ip || request.connection?.remoteAddress || "",
          userAgent: request.headers["user-agent"] || "",
          timestamp: new Date(),
        };

        this.eventEmitter.emit("audit.log", event);
      }),
    );
  }
}
