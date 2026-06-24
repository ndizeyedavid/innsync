export type RoomCategory = 'Garden' | 'Ocean' | 'Suite' | 'Villa';

export interface Room {
  externalId: string;
  hotelId: string;
  name: string;
  category: RoomCategory;
  size: string;
  beds: string;
  view: string;
  priceCents: number;
  currency: string;
  image: string;
  perks: string[];
  availableFrom?: Date;
  availableTo?: Date;
}

export interface RoomQuery {
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  category?: RoomCategory;
}
