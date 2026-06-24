import { Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { RoomServiceProvider } from '../../domain/providers/room-service.provider';
import {
  CreateRoomServiceTicketInput,
  RoomServiceStatus,
  RoomServiceTicket,
} from '../../domain/models/room-service.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { MockStore } from './mock-store';
import { MockFolioProvider } from './mock-folio.provider';

/**
 * Realistic room-service simulation.
 *
 *   - createTicket starts the lifecycle and posts a folio line.
 *   - A timer advances status preparing → on_the_way → delivered, mirroring
 *     the frontend's setInterval demo behavior.
 *   - subscribeStatus emits at each transition so OrdersService can fan out
 *     to WebSocket clients in real time.
 *
 * Idempotency: createTicket dedupes on the input.idempotencyKey. A second
 * call with the same key returns the originally-created ticket (true to
 * how the real upstream should behave; gives us a contract test target).
 */
@Injectable()
export class MockRoomServiceProvider implements RoomServiceProvider {
  private readonly logger = new Logger(MockRoomServiceProvider.name);
  private readonly NS = 'rs-ticket';
  private readonly KEY_NS = 'rs-key';
  private readonly subscribers = new Map<string, Set<(s: RoomServiceStatus, t: RoomServiceTicket) => void>>();

  constructor(
    private readonly store: MockStore,
    private readonly folios: MockFolioProvider,
  ) {}

  async createTicket(input: CreateRoomServiceTicketInput): Promise<ProviderResult<RoomServiceTicket>> {
    await this.store.delay();
    if (this.store.shouldFail('roomService')) return err('unavailable');

    // Idempotency: same key → same ticket.
    const existingId = await this.store.get<string>(this.KEY_NS, input.idempotencyKey);
    if (existingId) {
      const existing = await this.store.get<RoomServiceTicket>(this.NS, existingId);
      if (existing) return ok(rehydrate(existing));
    }

    const total = input.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    const ticket: RoomServiceTicket = {
      externalId: `MOCK-TKT-${createId().slice(0, 8).toUpperCase()}`,
      externalReservationId: input.externalReservationId,
      status: 'preparing',
      items: input.items,
      totalCents: total,
      currency: 'USD',
      placedAt: new Date(),
      etaMinutes: estimateEta(input.items),
    };
    await this.store.put(this.NS, ticket.externalId, ticket);
    await this.store.put(this.KEY_NS, input.idempotencyKey, ticket.externalId);

    // Post the charge onto the folio (cross-aggregate side effect modeled here)
    await this.folios.attachLine(input.externalReservationId, {
      externalId: `LN-${ticket.externalId}`,
      category: 'food',
      label: ticket.items.map((i) => `${i.quantity}× ${i.nameSnapshot}`).join(', '),
      amountCents: total,
      postedAt: ticket.placedAt,
    });

    // Schedule status advancement to simulate the kitchen
    this.scheduleAdvance(ticket.externalId);

    return ok(ticket);
  }

  async getTicket(externalId: string): Promise<ProviderResult<RoomServiceTicket>> {
    await this.store.delay();
    if (this.store.shouldFail('roomService')) return err('unavailable');
    const t = await this.store.get<RoomServiceTicket>(this.NS, externalId);
    return t ? ok(rehydrate(t)) : err('not_found');
  }

  async cancelTicket(externalId: string, reason?: string): Promise<ProviderResult<void>> {
    await this.store.delay();
    if (this.store.shouldFail('roomService')) return err('unavailable');
    const t = await this.store.get<RoomServiceTicket>(this.NS, externalId);
    if (!t) return err('not_found');
    if (t.status === 'delivered') return err('conflict');
    t.status = 'cancelled';
    await this.store.put(this.NS, externalId, t);
    this.emit(externalId, 'cancelled', rehydrate(t));
    return ok(undefined);
  }

  async subscribeStatus(
    externalId: string,
    handler: (status: RoomServiceStatus, ticket: RoomServiceTicket) => void,
  ): Promise<() => void> {
    const set = this.subscribers.get(externalId) ?? new Set();
    set.add(handler);
    this.subscribers.set(externalId, set);
    return () => {
      set.delete(handler);
    };
  }

  // ─── State machine simulation ─────────────────────────────────────

  private scheduleAdvance(externalId: string): void {
    // preparing → on_the_way after 14s (matches frontend's demo timer)
    setTimeout(() => this.transition(externalId, 'on_the_way'), 14_000);
    // on_the_way → delivered after another 22s
    setTimeout(() => this.transition(externalId, 'delivered'), 36_000);
  }

  private async transition(externalId: string, to: RoomServiceStatus): Promise<void> {
    const t = await this.store.get<RoomServiceTicket>(this.NS, externalId);
    if (!t) return;
    if (t.status === 'cancelled') return; // cancelled is terminal
    t.status = to;
    if (to === 'delivered') t.deliveredAt = new Date();
    await this.store.put(this.NS, externalId, t);
    this.emit(externalId, to, rehydrate(t));
  }

  private emit(externalId: string, status: RoomServiceStatus, ticket: RoomServiceTicket): void {
    const set = this.subscribers.get(externalId);
    if (!set) return;
    for (const h of set) {
      try {
        h(status, ticket);
      } catch (e) {
        this.logger.warn({ err: e }, 'subscriber threw');
      }
    }
  }
}

function rehydrate(t: RoomServiceTicket): RoomServiceTicket {
  return {
    ...t,
    placedAt: new Date(t.placedAt),
    deliveredAt: t.deliveredAt ? new Date(t.deliveredAt) : undefined,
  };
}

function estimateEta(items: { prepMinutes?: number; quantity: number }[]): number {
  const max = items.reduce(
    (m, i) => Math.max(m, (i as { prepMinutes?: number }).prepMinutes ?? 15),
    0,
  );
  return Math.max(10, max + 5);
}
