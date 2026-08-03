import { Injectable, Logger } from '@nestjs/common';
import { RoomServiceProvider } from '../../domain/providers/room-service.provider';
import {
  CreateRoomServiceTicketInput,
  RoomServiceStatus,
  RoomServiceTicket,
} from '../../domain/models/room-service.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { ExternalHmsClient } from './external-hms.client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CircuitOpenError,
  ConnectError,
  NotFoundHttpError,
  TimeoutError,
} from 'src/infrastructure/http/http-errors';

interface ExternalTicketDto {
  id: string;
  reservation_id: string;
  state: 'queued' | 'preparing' | 'on_route' | 'delivered' | 'cancelled' | 'failed';
  items: { menu_item_id: string; name: string; qty: number; unit_price_minor: number; note?: string }[];
  total_minor: number;
  currency: string;
  placed_at: string;
  eta_minutes: number;
  delivered_at?: string;
}

@Injectable()
export class ExternalRoomServiceProvider implements RoomServiceProvider {
  private readonly logger = new Logger(ExternalRoomServiceProvider.name);

  constructor(
    private readonly http: ExternalHmsClient,
    private readonly prisma: PrismaService,
  ) {}

  async createTicket(input: CreateRoomServiceTicketInput): Promise<ProviderResult<RoomServiceTicket>> {
    try {
      const dto = await this.http.post<ExternalTicketDto>(
        `/v1/reservations/${input.externalReservationId}/room-service`,
        {
          items: input.items.map((i) => ({
            menu_item_id: i.externalMenuItemId,
            name: i.nameSnapshot,
            qty: i.quantity,
            unit_price_minor: i.unitPriceCents,
            note: i.note,
          })),
          notes: input.notes,
        },
        { operation: 'createTicket', idempotencyKey: input.idempotencyKey },
      );
      const t = mapTicket(dto);
      await this.cache(t);
      return ok(t);
    } catch (e) {
      if (e instanceof NotFoundHttpError) return err('not_found');
      return err('unavailable', e);
    }
  }

  async getTicket(externalId: string): Promise<ProviderResult<RoomServiceTicket>> {
    try {
      const dto = await this.http.get<ExternalTicketDto>(`/v1/room-service/${externalId}`, {
        operation: 'getTicket',
      });
      const t = mapTicket(dto);
      await this.cache(t);
      return ok(t);
    } catch (e) {
      const cached = await this.readCache(externalId);
      if (
        cached &&
        (e instanceof TimeoutError || e instanceof ConnectError || e instanceof CircuitOpenError)
      ) {
        return { ok: true, data: cached, source: 'cache' };
      }
      if (e instanceof NotFoundHttpError) return err('not_found');
      return err('unavailable', e, cached ?? undefined);
    }
  }

  async cancelTicket(externalId: string, reason?: string): Promise<ProviderResult<void>> {
    try {
      await this.http.post(
        `/v1/room-service/${externalId}/cancel`,
        { reason },
        { operation: 'cancelTicket', idempotencyKey: `cancel-${externalId}` },
      );
      return ok(undefined);
    } catch (e) {
      return err('unavailable', e);
    }
  }

  private async cache(t: RoomServiceTicket): Promise<void> {
    await this.prisma.roomServiceTicketCache.upsert({
      where: { externalId: t.externalId },
      update: { snapshot: t as unknown as object, fetchedAt: new Date() },
      create: { externalId: t.externalId, snapshot: t as unknown as object },
    });
  }

  private async readCache(externalId: string): Promise<RoomServiceTicket | null> {
    const row = await this.prisma.roomServiceTicketCache.findUnique({ where: { externalId } });
    return row ? (row.snapshot as unknown as RoomServiceTicket) : null;
  }
}

function mapTicket(dto: ExternalTicketDto): RoomServiceTicket {
  return {
    externalId: dto.id,
    externalReservationId: dto.reservation_id,
    status: mapStatus(dto.state),
    items: dto.items.map((i) => ({
      externalMenuItemId: i.menu_item_id,
      nameSnapshot: i.name,
      quantity: i.qty,
      unitPriceCents: i.unit_price_minor,
      note: i.note,
    })),
    totalCents: dto.total_minor,
    currency: dto.currency,
    placedAt: new Date(dto.placed_at),
    etaMinutes: dto.eta_minutes,
    deliveredAt: dto.delivered_at ? new Date(dto.delivered_at) : undefined,
  };
}

function mapStatus(s: ExternalTicketDto['state']): RoomServiceStatus {
  // upstream "on_route" → our "on_the_way"
  if (s === 'on_route') return 'on_the_way';
  return s as RoomServiceStatus;
}
