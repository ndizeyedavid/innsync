import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { HousekeepingProvider } from '../../domain/providers/housekeeping.provider';
import {
  CreateHousekeepingTaskInput,
  HousekeepingTask,
} from '../../domain/models/housekeeping.model';
import { err, ok, ProviderResult } from '../../domain/provider-result';
import { MockStore } from './mock-store';

@Injectable()
export class MockHousekeepingProvider implements HousekeepingProvider {
  private readonly NS = 'hk-task';
  private readonly KEY_NS = 'hk-key';

  constructor(private readonly store: MockStore) {}

  async createTask(input: CreateHousekeepingTaskInput): Promise<ProviderResult<HousekeepingTask>> {
    await this.store.delay();
    if (this.store.shouldFail('housekeeping')) return err('unavailable');

    const existingId = await this.store.get<string>(this.KEY_NS, input.idempotencyKey);
    if (existingId) {
      const existing = await this.store.get<HousekeepingTask>(this.NS, existingId);
      if (existing) return ok(rehydrate(existing));
    }

    const task: HousekeepingTask = {
      externalId: `MOCK-HK-${createId().slice(0, 8).toUpperCase()}`,
      externalReservationId: input.externalReservationId,
      kind: input.kind,
      status: 'queued',
      notes: input.notes,
      scheduledFor: input.scheduledFor,
    };
    await this.store.put(this.NS, task.externalId, task);
    await this.store.put(this.KEY_NS, input.idempotencyKey, task.externalId);

    // Auto-progress for demo realism
    setTimeout(() => this.advance(task.externalId, 'assigned'), 2_000);
    setTimeout(() => this.advance(task.externalId, 'in_progress'), 10_000);
    setTimeout(() => this.advance(task.externalId, 'completed'), 28_000);

    return ok(task);
  }

  async getTask(externalId: string): Promise<ProviderResult<HousekeepingTask>> {
    await this.store.delay();
    if (this.store.shouldFail('housekeeping')) return err('unavailable');
    const t = await this.store.get<HousekeepingTask>(this.NS, externalId);
    return t ? ok(rehydrate(t)) : err('not_found');
  }

  async listForReservation(externalReservationId: string): Promise<ProviderResult<HousekeepingTask[]>> {
    await this.store.delay();
    if (this.store.shouldFail('housekeeping')) return err('unavailable', undefined, []);
    const all = await this.store.list<HousekeepingTask>(this.NS);
    return ok(
      all
        .filter((t) => t.externalReservationId === externalReservationId)
        .map(rehydrate),
    );
  }

  async cancelTask(externalId: string): Promise<ProviderResult<void>> {
    await this.store.delay();
    if (this.store.shouldFail('housekeeping')) return err('unavailable');
    const t = await this.store.get<HousekeepingTask>(this.NS, externalId);
    if (!t) return err('not_found');
    if (t.status === 'completed') return err('conflict');
    t.status = 'cancelled';
    await this.store.put(this.NS, externalId, t);
    return ok(undefined);
  }

  private async advance(externalId: string, to: HousekeepingTask['status']): Promise<void> {
    const t = await this.store.get<HousekeepingTask>(this.NS, externalId);
    if (!t || t.status === 'cancelled') return;
    t.status = to;
    if (to === 'completed') t.completedAt = new Date();
    await this.store.put(this.NS, externalId, t);
  }
}

function rehydrate(t: HousekeepingTask): HousekeepingTask {
  return {
    ...t,
    scheduledFor: t.scheduledFor ? new Date(t.scheduledFor) : undefined,
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
  };
}
