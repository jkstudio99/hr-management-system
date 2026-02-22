import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Only audit mutating operations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const user = req.user;
    const path: string = req.route?.path ?? req.url;
    const entity = this.extractEntity(path);

    return next.handle().pipe(
      tap((responseBody) => {
        const entityId =
          (responseBody?.id ?? req.params?.id)
            ? parseInt(req.params?.id, 10)
            : undefined;

        this.auditLogService
          .log({
            userId: user?.sub,
            username: user?.username,
            action: this.methodToAction(method),
            entity,
            entityId: isNaN(entityId as number) ? undefined : entityId,
            newValue:
              method !== 'DELETE'
                ? JSON.stringify(responseBody)?.substring(0, 2000)
                : undefined,
            ipAddress: req.ip,
            userAgent: req.headers?.['user-agent']?.substring(0, 255),
          })
          .catch(() => {
            /* silently ignore audit failures */
          });
      }),
    );
  }

  private methodToAction(method: string): string {
    const map: Record<string, string> = {
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };
    return map[method] ?? method;
  }

  private extractEntity(path: string): string {
    // /api/employees/1 → "employees"
    const parts = path.replace('/api/', '').split('/');
    return parts[0] ?? 'unknown';
  }
}
