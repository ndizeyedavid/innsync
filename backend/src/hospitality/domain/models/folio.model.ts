export type FolioLineCategory = 'room' | 'food' | 'spa' | 'activity' | 'tax' | 'discount';

export interface FolioLine {
  externalId: string;
  category: FolioLineCategory;
  label: string;
  detail?: string;
  amountCents: number;
  postedAt?: Date;
}

export interface Folio {
  externalReservationId: string;
  lines: FolioLine[];
  totalCents: number;
  currency: string;
  /** Whether the upstream has finalized this folio (no more lines posting). */
  finalized: boolean;
}
