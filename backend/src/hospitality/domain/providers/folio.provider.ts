import { ProviderResult } from '../provider-result';
import { Folio } from '../models/folio.model';

export interface FolioProvider {
  /**
   * `forceRefresh: true` bypasses any cache layer the implementation may have.
   * Checkout flows MUST pass true so we never settle on a stale total.
   */
  getFolio(externalReservationId: string, opts?: { forceRefresh?: boolean }): Promise<ProviderResult<Folio>>;
  closeFolio(externalReservationId: string): Promise<ProviderResult<Folio>>;
}
