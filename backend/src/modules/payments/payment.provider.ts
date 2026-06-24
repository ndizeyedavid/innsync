/**
 * Payment provider abstraction — same pattern as the hospitality layer.
 * Production: implement against Stripe / Adyen / etc. Dev: MockPaymentProvider.
 *
 * Storing payment data is firmly out of scope: we deal in provider tokens.
 */

export interface PaymentMethodToken {
  providerCustomerId: string;
  providerPaymentMethodId: string;
  brand: string;
  last4: string;
}

export interface AuthorizeInput {
  userId: string;
  amountCents: number;
  currency: string;
  paymentMethodId: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentSnapshot {
  providerIntentId: string;
  status: 'requires_action' | 'authorized' | 'captured' | 'refunded' | 'failed';
  amountCents: number;
  currency: string;
}

export interface PaymentProvider {
  attachMethod(userId: string, providerToken: string): Promise<PaymentMethodToken>;
  authorize(input: AuthorizeInput): Promise<PaymentIntentSnapshot>;
  capture(providerIntentId: string, idempotencyKey: string): Promise<PaymentIntentSnapshot>;
  refund(providerIntentId: string, amountCents: number, idempotencyKey: string): Promise<PaymentIntentSnapshot>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
