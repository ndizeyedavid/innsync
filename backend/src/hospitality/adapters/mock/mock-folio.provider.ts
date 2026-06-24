import { Injectable } from '@nestjs/common';
import { FolioProvider } from '../../domain/providers/folio.provider';
import { Folio, FolioLine } from '../../domain/models/folio.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { MockStore } from './mock-store';

/**
 * Folio accumulates lines as orders are placed (the mock room-service
 * provider posts charges via attachLine()). At checkout, the folio is
 * frozen.
 */
@Injectable()
export class MockFolioProvider implements FolioProvider {
  private readonly NS = 'folio';

  constructor(private readonly store: MockStore) {}

  async getFolio(externalReservationId: string): Promise<ProviderResult<Folio>> {
    await this.store.delay();
    if (this.store.shouldFail('folios')) return err('unavailable');
    const folio = await this.store.get<Folio>(this.NS, externalReservationId);
    if (!folio) {
      // Auto-seed a small room charge so first reads look realistic
      const seeded = this.seed(externalReservationId);
      await this.store.put(this.NS, externalReservationId, seeded);
      return ok(seeded);
    }
    return ok(rehydrate(folio));
  }

  async closeFolio(externalReservationId: string): Promise<ProviderResult<Folio>> {
    await this.store.delay();
    if (this.store.shouldFail('folios')) return err('unavailable');
    const folio = await this.store.get<Folio>(this.NS, externalReservationId);
    if (!folio) return err('not_found');
    folio.finalized = true;
    await this.store.put(this.NS, externalReservationId, folio);
    return ok(rehydrate(folio));
  }

  /** Hook used by mock-room-service to post charges. Not part of the interface. */
  async attachLine(externalReservationId: string, line: FolioLine): Promise<void> {
    const folio =
      (await this.store.get<Folio>(this.NS, externalReservationId)) ??
      this.seed(externalReservationId);
    folio.lines.push(line);
    folio.totalCents = folio.lines.reduce((s, l) => s + l.amountCents, 0);
    await this.store.put(this.NS, externalReservationId, folio);
  }

  private seed(externalReservationId: string): Folio {
    return {
      externalReservationId,
      lines: [
        {
          externalId: `LN-${externalReservationId}-room`,
          category: 'room',
          label: 'Room — 1 night',
          amountCents: 22_000,
          postedAt: new Date(),
        },
        {
          externalId: `LN-${externalReservationId}-tax`,
          category: 'tax',
          label: 'Tax & fees',
          amountCents: 2_200,
          postedAt: new Date(),
        },
      ],
      totalCents: 24_200,
      currency: 'USD',
      finalized: false,
    };
  }
}

function rehydrate(f: Folio): Folio {
  return {
    ...f,
    lines: f.lines.map((l) => ({
      ...l,
      postedAt: l.postedAt ? new Date(l.postedAt) : undefined,
    })),
  };
}
