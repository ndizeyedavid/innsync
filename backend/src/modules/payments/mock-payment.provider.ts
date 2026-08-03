import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import {
  AuthorizeInput,
  PaymentIntentSnapshot,
  PaymentMethodToken,
  PaymentProvider,
} from './payment.provider';

/**
 * In-memory mock — accepts everything, simulates the lifecycle.
 * Test hooks: pass `forceFail: true` via metadata.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private intents = new Map<string, PaymentIntentSnapshot>();

  async attachMethod(_userId: string, providerToken: string): Promise<PaymentMethodToken> {
    return {
      providerCustomerId: `mock_cus_${createId().slice(0, 6)}`,
      providerPaymentMethodId: `mock_pm_${providerToken.slice(0, 6)}`,
      brand: 'visa',
      last4: '4242',
    };
  }

  async authorize(input: AuthorizeInput): Promise<PaymentIntentSnapshot> {
    const id = `mock_pi_${createId().slice(0, 12)}`;
    const status = input.metadata?.forceFail === 'true' ? 'failed' : 'authorized';
    const snap: PaymentIntentSnapshot = {
      providerIntentId: id,
      status,
      amountCents: input.amountCents,
      currency: input.currency,
    };
    this.intents.set(id, snap);
    return snap;
  }

  async capture(providerIntentId: string): Promise<PaymentIntentSnapshot> {
    const existing = this.intents.get(providerIntentId);
    if (!existing) throw new Error('intent not found');
    const next = { ...existing, status: 'captured' as const };
    this.intents.set(providerIntentId, next);
    return next;
  }

  async refund(providerIntentId: string): Promise<PaymentIntentSnapshot> {
    const existing = this.intents.get(providerIntentId);
    if (!existing) throw new Error('intent not found');
    const next = { ...existing, status: 'refunded' as const };
    this.intents.set(providerIntentId, next);
    return next;
  }
}
