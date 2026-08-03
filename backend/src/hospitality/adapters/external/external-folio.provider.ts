import { Injectable, Logger } from '@nestjs/common';
import { FolioProvider } from '../../domain/providers/folio.provider';
import { Folio, FolioLine, FolioLineCategory } from '../../domain/models/folio.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { ExternalHmsClient } from './external-hms.client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CircuitOpenError,
  ConnectError,
  NotFoundHttpError,
  TimeoutError,
} from 'src/infrastructure/http/http-errors';

interface ExternalFolioLineDto {
  id: string;
  category: string;
  description: string;
  detail?: string;
  amount_minor_units: number;
  posted_at?: string;
}

interface ExternalFolioDto {
  reservation_id: string;
  status: 'open' | 'finalized';
  lines: ExternalFolioLineDto[];
  total_minor_units: number;
  currency: string;
}

@Injectable()
export class ExternalFolioProvider implements FolioProvider {
  private readonly logger = new Logger(ExternalFolioProvider.name);

  constructor(
    private readonly http: ExternalHmsClient,
    private readonly prisma: PrismaService,
  ) {}

  async getFolio(
    externalReservationId: string,
    opts?: { forceRefresh?: boolean },
  ): Promise<ProviderResult<Folio>> {
    try {
      const dto = await this.http.get<ExternalFolioDto>(
        `/v1/reservations/${externalReservationId}/folio`,
        { operation: 'getFolio' },
      );
      const folio = mapFolio(dto);
      await this.upsertCache(folio);
      return ok(folio);
    } catch (e) {
      const cached = await this.readCache(externalReservationId);
      if (!opts?.forceRefresh && cached &&
        (e instanceof TimeoutError || e instanceof ConnectError || e instanceof CircuitOpenError)
      ) {
        this.logger.warn({ externalReservationId }, 'folio degraded → cache');
        return { ok: true, data: cached, source: 'cache' };
      }
      if (e instanceof NotFoundHttpError) return err('not_found');
      return err('unavailable', e, cached ?? undefined);
    }
  }

  async closeFolio(externalReservationId: string): Promise<ProviderResult<Folio>> {
    try {
      const dto = await this.http.post<ExternalFolioDto>(
        `/v1/reservations/${externalReservationId}/folio/close`,
        {},
        { operation: 'closeFolio', idempotencyKey: `close-folio-${externalReservationId}` },
      );
      const folio = mapFolio(dto);
      await this.upsertCache(folio);
      return ok(folio);
    } catch (e) {
      return err('unavailable', e);
    }
  }

  private async upsertCache(folio: Folio): Promise<void> {
    await this.prisma.folioCache.upsert({
      where: { externalReservationId: folio.externalReservationId },
      update: {
        snapshot: folio as unknown as object,
        totalCents: folio.totalCents,
        currency: folio.currency,
        fetchedAt: new Date(),
      },
      create: {
        externalReservationId: folio.externalReservationId,
        snapshot: folio as unknown as object,
        totalCents: folio.totalCents,
        currency: folio.currency,
      },
    });
  }

  private async readCache(externalReservationId: string): Promise<Folio | null> {
    const row = await this.prisma.folioCache.findUnique({ where: { externalReservationId } });
    return row ? (row.snapshot as unknown as Folio) : null;
  }
}

function mapFolio(dto: ExternalFolioDto): Folio {
  return {
    externalReservationId: dto.reservation_id,
    finalized: dto.status === 'finalized',
    totalCents: dto.total_minor_units,
    currency: dto.currency,
    lines: dto.lines.map(mapLine),
  };
}

function mapLine(l: ExternalFolioLineDto): FolioLine {
  return {
    externalId: l.id,
    category: normalizeCategory(l.category),
    label: l.description,
    detail: l.detail,
    amountCents: l.amount_minor_units,
    postedAt: l.posted_at ? new Date(l.posted_at) : undefined,
  };
}

function normalizeCategory(c: string): FolioLineCategory {
  const k = c.toLowerCase();
  if (k === 'food' || k === 'beverage') return 'food';
  if (k === 'spa') return 'spa';
  if (k === 'activity' || k === 'excursion') return 'activity';
  if (k === 'tax' || k === 'fee') return 'tax';
  if (k === 'discount' || k === 'promo') return 'discount';
  return 'room';
}
