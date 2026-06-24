import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PAYMENT_PROVIDER, PaymentProvider } from './payment.provider';
import { NotFoundError } from 'src/common/errors/domain.errors';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async attachMethod(userId: string, providerToken: string, makeDefault = false) {
    const t = await this.provider.attachMethod(userId, providerToken);
    if (makeDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.paymentMethod.create({
      data: {
        id: createId(),
        userId,
        brand: t.brand,
        last4: t.last4,
        providerCustomerId: t.providerCustomerId,
        providerPaymentMethodId: t.providerPaymentMethodId,
        isDefault: makeDefault,
      },
    });
  }

  async listMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteMethod(userId: string, methodId: string) {
    const method = await this.prisma.paymentMethod.findFirst({
      where: { id: methodId, userId },
    });
    if (!method) throw new NotFoundError('Payment method not found');
    return this.prisma.paymentMethod.update({
      where: { id: methodId },
      data: { deletedAt: new Date() },
    });
  }

  async authorize(input: {
    userId: string;
    paymentMethodId: string;
    amountCents: number;
    currency?: string;
    stayId?: string;
    idempotencyKey: string;
  }) {
    const method = await this.prisma.paymentMethod.findFirst({
      where: { id: input.paymentMethodId, userId: input.userId },
    });
    if (!method) throw new NotFoundError('Payment method not found');

    const snap = await this.provider.authorize({
      userId: input.userId,
      paymentMethodId: method.providerPaymentMethodId,
      amountCents: input.amountCents,
      currency: input.currency ?? 'USD',
      idempotencyKey: input.idempotencyKey,
    });

    return this.prisma.paymentIntent.create({
      data: {
        id: createId(),
        userId: input.userId,
        guestStayId: input.stayId,
        amountCents: snap.amountCents,
        currency: snap.currency,
        status: mapStatus(snap.status),
        providerIntentId: snap.providerIntentId,
        providerCustomerId: method.providerCustomerId ?? undefined,
        metadata: { idempotencyKey: input.idempotencyKey } as Prisma.InputJsonValue,
      },
    });
  }
}

function mapStatus(s: string): PaymentStatus {
  switch (s) {
    case 'requires_action':
      return PaymentStatus.REQUIRES_ACTION;
    case 'authorized':
      return PaymentStatus.AUTHORIZED;
    case 'captured':
      return PaymentStatus.CAPTURED;
    case 'refunded':
      return PaymentStatus.REFUNDED;
    default:
      return PaymentStatus.FAILED;
  }
}
