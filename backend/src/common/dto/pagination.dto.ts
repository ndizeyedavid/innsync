import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Cursor-based pagination — preferred for unbounded collections (orders, events).
 * Cursors are opaque to clients; we encode (sortField, id) at the application layer.
 */
export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/**
 * Offset pagination — only for bounded sets (e.g., months in loyalty history).
 */
export class OffsetPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export interface PageMeta {
  nextCursor?: string;
  hasMore: boolean;
  count: number;
}
