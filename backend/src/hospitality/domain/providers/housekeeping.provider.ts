import { ProviderResult } from '../provider-result';
import { CreateHousekeepingTaskInput, HousekeepingTask } from '../models/housekeeping.model';

export interface HousekeepingProvider {
  createTask(input: CreateHousekeepingTaskInput): Promise<ProviderResult<HousekeepingTask>>;
  getTask(externalId: string): Promise<ProviderResult<HousekeepingTask>>;
  listForReservation(externalReservationId: string): Promise<ProviderResult<HousekeepingTask[]>>;
  cancelTask(externalId: string): Promise<ProviderResult<void>>;
}
