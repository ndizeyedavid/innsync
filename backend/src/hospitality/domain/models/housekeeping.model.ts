export type HousekeepingTaskStatus =
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type HousekeepingTaskKind =
  | 'cleaning'
  | 'turn_down'
  | 'towels'
  | 'amenities'
  | 'maintenance';

export interface HousekeepingTask {
  externalId: string;
  externalReservationId: string;
  kind: HousekeepingTaskKind;
  status: HousekeepingTaskStatus;
  notes?: string;
  scheduledFor?: Date;
  completedAt?: Date;
}

export interface CreateHousekeepingTaskInput {
  externalReservationId: string;
  kind: HousekeepingTaskKind;
  notes?: string;
  scheduledFor?: Date;
  idempotencyKey: string;
}
