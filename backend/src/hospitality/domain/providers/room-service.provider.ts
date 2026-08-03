import { ProviderResult } from '../provider-result';
import {
  CreateRoomServiceTicketInput,
  RoomServiceStatus,
  RoomServiceTicket,
} from '../models/room-service.model';

export interface RoomServiceProvider {
  createTicket(input: CreateRoomServiceTicketInput): Promise<ProviderResult<RoomServiceTicket>>;
  getTicket(externalId: string): Promise<ProviderResult<RoomServiceTicket>>;
  cancelTicket(externalId: string, reason?: string): Promise<ProviderResult<void>>;
  /**
   * Subscription is optional — the HMS may not push updates. When it doesn't,
   * the OrderReconciler service polls via getTicket on a tight loop.
   */
  subscribeStatus?(
    externalId: string,
    handler: (status: RoomServiceStatus, ticket: RoomServiceTicket) => void,
  ): Promise<() => void>;
}
