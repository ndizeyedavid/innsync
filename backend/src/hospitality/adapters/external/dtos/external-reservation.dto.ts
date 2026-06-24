/**
 * External HMS DTO shapes — what the upstream actually returns.
 *
 * IMPORTANT:
 *   - These types live in the adapter layer only. Domain code MUST NOT
 *     import from this file.
 *   - When the HMS API changes, only this file + its mapper need updating;
 *     contract tests will catch drift between mock and external.
 *   - Versioned filename (`v1`) so when the upstream introduces breaking
 *     changes, both can coexist briefly.
 *
 * Filling in the response schema is an iterative exercise: we begin with
 * what the API currently returns, and refine as the upstream stabilizes.
 */

export interface ExternalReservationV1Dto {
  id: string;
  hotel_id: string;
  guest: { id: string; full_name?: string };
  state: 'pending' | 'confirmed' | 'in_house' | 'departed' | 'cancelled';
  arrival_date: string;   // ISO 8601
  departure_date: string;
  party: { adults: number; children: number };
  assigned_room?: { id: string } | null;
  pricing: { total_minor_units: number; currency: string };
  metadata?: Record<string, unknown>;
}

export interface ExternalCreateReservationV1Payload {
  hotel_id: string;
  guest_id: string;
  arrival_date: string;
  departure_date: string;
  adults: number;
  children: number;
  preferences?: {
    room_category?: string;
  };
  metadata?: Record<string, unknown>;
}
