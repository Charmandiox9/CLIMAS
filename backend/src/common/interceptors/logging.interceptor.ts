import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    const start = Date.now();

    const section = context.getClass().name;
    const operation = context.getHandler().name;

    const method = req.method;
    const url = req.url;

    const user = (req as any).user;
    const userIdentifier = user?.codigo
      ? user.codigo
      : user?.id
        ? `User:${user.id}`
        : 'Anon';
    const userLabel = `[${userIdentifier}]`;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const durationStr = `${duration}ms`.padEnd(7, ' ');

        this.logger.log(
          `${userLabel.padEnd(10)} ${section} > ${method} ${url} > ${operation} (${durationStr})`,
        );
      }),
    );
  }
}
