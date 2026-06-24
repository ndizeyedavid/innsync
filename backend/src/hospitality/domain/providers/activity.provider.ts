import { ProviderResult } from '../provider-result';
import { Activity, ActivityQuery } from '../models/activity.model';

/**
 * Activities can live either in the HMS (some properties model excursions as
 * inventory) or be entirely our domain (we curate the catalog locally and
 * just store guest picks in our DB). The interface accommodates both.
 */
export interface ActivityProvider {
  search(query: ActivityQuery): Promise<ProviderResult<Activity[]>>;
  getById(externalId: string): Promise<ProviderResult<Activity>>;
  reservePermit(externalId: string, idempotencyKey: string): Promise<ProviderResult<Activity>>;
}
