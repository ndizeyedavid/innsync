/**
 * Canonical list of internal domain events.
 *
 * Adding an event:
 *   1. Add its name to the union.
 *   2. Add its payload shape to the EventPayloads map below.
 *   3. Emit via EventBus.emit('name', payload). Subscribe via @OnEvent('name').
 *
 * Why centralize? Event names become stringly-typed in handlers; this file
 * is the cure for typos and the place to audit event surface area.
 */

import { OrderStatus } from '@prisma/client';

export type DomainEventName =
  | 'order.placed'
  | 'order.status_changed'
  | 'order.completed'
  | 'order.failed'
  | 'reservation.fetched'
  | 'reservation.drift_detected'
  | 'reservation.checked_in'
  | 'checkout.completed'
  | 'digital_key.unlock_attempt'
  | 'loyalty.points_awarded'
  | 'notification.created'
  | 'stay.checked_in'
  | 'stay.checked_out'
  | 'housekeeping.task_requested'
  | 'housekeeping.task_completed';

export interface OrderPlacedPayload {
  orderId: string;
  userId: string;
  guestStayId: string;
  totalCents: number;
  currency: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  userId: string;
  from: OrderStatus;
  to: OrderStatus;
  etaMinutes?: number | null;
}

export interface OrderCompletedPayload {
  orderId: string;
  userId: string;
  totalCents: number;
}

export interface OrderFailedPayload {
  orderId: string;
  userId: string;
  reason: string;
}

export interface ReservationFetchedPayload {
  externalId: string;
  userId?: string;
  source: 'live' | 'cache';
}

export interface ReservationDriftPayload {
  externalId: string;
  driftedFields: string[];
}

export interface CheckedInPayload {
  stayId: string;
  externalReservationId: string;
  userId: string;
}

export interface CheckoutCompletedPayload {
  stayId: string;
  userId: string;
  totalCents: number;
}

export interface DigitalKeyUnlockPayload {
  userId: string;
  digitalKeyId: string;
  method: 'BLE' | 'PIN' | 'NFC';
  result: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
}

export interface LoyaltyAwardedPayload {
  userId: string;
  points: number;
  reason: string;
}

export interface StayCheckedInPayload {
  stayId: string;
  userId: string;
  staffUserId: string;
}

export interface StayCheckedOutPayload {
  stayId: string;
  userId: string;
  staffUserId: string;
}

export interface NotificationCreatedPayload {
  notificationId: string;
  userId: string;
  channel: 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS';
}

export interface HousekeepingTaskRequestedPayload {
  stayId: string;
  userId: string;
  kind: string;
  taskId: string;
}

export interface HousekeepingTaskCompletedPayload {
  stayId: string;
  userId: string;
  kind: string;
  taskId: string;
}

export type EventPayloads = {
  'order.placed': OrderPlacedPayload;
  'order.status_changed': OrderStatusChangedPayload;
  'order.completed': OrderCompletedPayload;
  'order.failed': OrderFailedPayload;
  'reservation.fetched': ReservationFetchedPayload;
  'reservation.drift_detected': ReservationDriftPayload;
  'reservation.checked_in': CheckedInPayload;
  'checkout.completed': CheckoutCompletedPayload;
  'digital_key.unlock_attempt': DigitalKeyUnlockPayload;
  'loyalty.points_awarded': LoyaltyAwardedPayload;
  'notification.created': NotificationCreatedPayload;
  'stay.checked_in': StayCheckedInPayload;
  'stay.checked_out': StayCheckedOutPayload;
  'housekeeping.task_requested': HousekeepingTaskRequestedPayload;
  'housekeeping.task_completed': HousekeepingTaskCompletedPayload;
};
