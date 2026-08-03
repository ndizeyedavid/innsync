import { Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import * as argon2 from 'argon2';
import { DigitalKeyMethod, DigitalKeyResult } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/common/errors/domain.errors';

/**
 * Digital key issuance + unlock-event logging.
 *
 * Note: actual BLE/NFC unlock happens on the device; the server's job is to
 * issue/revoke and record attempts (success and failure) for audit + analytics.
 */
@Injectable()
export class DigitalKeyService {
  private readonly logger = new Logger(DigitalKeyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBus,
  ) {}

  async issue(userId: string, stayId: string, externalRoomId: string, expiresAt: Date, pin?: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');
    if (stay.status !== 'CHECKED_IN') throw new ConflictError('Must be checked in to receive a key');

    return this.prisma.digitalKey.create({
      data: {
        id: createId(),
        guestStayId: stayId,
        externalRoomId,
        expiresAt,
        pinHash: pin ? await argon2.hash(pin, { type: argon2.argon2id }) : null,
      },
    });
  }

  async recordUnlock(userId: string, digitalKeyId: string, method: DigitalKeyMethod, result: DigitalKeyResult) {
    const key = await this.prisma.digitalKey.findUnique({ where: { id: digitalKeyId } });
    if (!key) throw new NotFoundError('Key not found');
    const event = await this.prisma.digitalKeyEvent.create({
      data: { id: createId(), digitalKeyId, userId, method, result },
    });
    this.events.emit('digital_key.unlock_attempt', {
      userId,
      digitalKeyId,
      method: method as 'BLE' | 'PIN' | 'NFC',
      result: result as 'SUCCESS' | 'FAILED' | 'TIMEOUT',
    });
    return event;
  }

  async verifyPin(userId: string, digitalKeyId: string, pin: string): Promise<boolean> {
    const key = await this.prisma.digitalKey.findUnique({
      where: { id: digitalKeyId },
      include: { stay: { select: { userId: true } } },
    });
    if (!key || key.stay.userId !== userId || !key.pinHash) return false;
    return argon2.verify(key.pinHash, pin);
  }
}
