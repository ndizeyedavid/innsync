import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { DomainError } from '../errors/domain.errors';

/**
 * Global error → RFC 7807 (Problem Details) response.
 *
 * Three-tier mapping:
 *   1. DomainError subclasses → use their httpStatus + code.
 *   2. NestJS HttpException → preserve status, derive a code from the class.
 *   3. Anything else → 500, log full stack, mask details from the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { status, code, title, detail, extra } = this.classify(exception);
    const traceId = (req.headers['x-request-id'] as string | undefined) ?? undefined;

    // Server-side observability: log everything with stack + structured fields.
    // Clients only get a sanitized body.
    if (status >= 500) {
      this.logger.error(
        { err: exception, path: req.url, method: req.method, status, code, traceId },
        title,
      );
    } else {
      this.logger.warn({ err: exception, path: req.url, status, code, traceId }, title);
    }

    res.status(status).json({
      type: `https://innsync.dev/errors/${code.toLowerCase().replace(/_/g, '-')}`,
      title,
      status,
      detail,
      code,
      instance: req.url,
      traceId,
      ...extra,
    });
  }

  private classify(e: unknown): {
    status: number;
    code: string;
    title: string;
    detail: string;
    extra?: Record<string, unknown>;
  } {
    if (e instanceof DomainError) {
      return {
        status: e.httpStatus,
        code: e.code,
        title: e.message,
        detail: e.message,
        extra: 'details' in e ? { details: (e as { details: unknown }).details } : undefined,
      };
    }

    if (e instanceof HttpException) {
      const status = e.getStatus();
      const resp = e.getResponse();
      const detail =
        typeof resp === 'string'
          ? resp
          : (resp as { message?: string | string[] }).message
            ? Array.isArray((resp as { message: string[] }).message)
              ? (resp as { message: string[] }).message.join('; ')
              : (resp as { message: string }).message
            : e.message;
      const validationDetails =
        typeof resp === 'object' && Array.isArray((resp as { message?: unknown[] }).message)
          ? { details: (resp as { message: string[] }).message }
          : undefined;
      return {
        status,
        code: this.codeFromHttpStatus(status),
        title: e.message,
        detail: typeof detail === 'string' ? detail : e.message,
        extra: validationDetails,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      title: 'Internal server error',
      detail: 'An unexpected error occurred. The team has been notified.',
    };
  }

  private codeFromHttpStatus(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_FAILED';
      case 429:
        return 'RATE_LIMITED';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      default:
        return `HTTP_${status}`;
    }
  }
}
