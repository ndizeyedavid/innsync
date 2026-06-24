export type ActivityAvailability = 'available' | 'permit-required' | 'fully-booked';

export interface Activity {
  externalId: string;
  hotelId: string;
  day: number;            // day-of-stay (1-indexed)
  startTime: string;      // "HH:mm"
  endTime: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  availability: ActivityAvailability;
  permitsRemaining?: number;
  durationMinutes: number;
  priceCents?: number;
  currency?: string;
}

export interface ActivityQuery {
  hotelId: string;
  day?: number;
}
