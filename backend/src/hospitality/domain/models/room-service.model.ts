export type RoomServiceStatus =
  | 'queued'
  | 'preparing'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface RoomServiceTicketItem {
  externalMenuItemId: string;
  nameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  note?: string;
}

export interface RoomServiceTicket {
  externalId: string;
  externalReservationId: string;
  status: RoomServiceStatus;
  items: RoomServiceTicketItem[];
  totalCents: number;
  currency: string;
  placedAt: Date;
  etaMinutes: number;
  deliveredAt?: Date;
}

export interface CreateRoomServiceTicketInput {
  externalReservationId: string;
  items: RoomServiceTicketItem[];
  notes?: string;
  /** Outbound idempotency key — HMS dedupes if it sees the same key twice. */
  idempotencyKey: string;
}
