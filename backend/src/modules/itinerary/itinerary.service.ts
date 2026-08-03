import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ACTIVITY_PROVIDER } from 'src/hospitality/tokens';
import { ActivityProvider } from 'src/hospitality/domain/providers/activity.provider';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/common/errors/domain.errors';

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ACTIVITY_PROVIDER) private readonly activities: ActivityProvider,
  ) {}

  /** Day-by-day plan combining catalog activities + the guest's picks. */
  async getForStay(userId: string, stayId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');

    const catalog = await this.activities.search({ hotelId: stay.hotelId ?? 'demo-hotel' });
    const picks = await this.prisma.itineraryItem.findMany({
      where: { guestStayId: stayId },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
    return {
      catalog: catalog.ok ? catalog.data : [],
      picks,
      _meta: catalog.ok ? { source: catalog.source } : { source: 'cache', degraded: true },
    };
  }

  async bookActivity(userId: string, stayId: string, externalActivityId: string) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');

    // Reserve the permit upstream first so we don't promise something that's gone.
    const idempotencyKey = `book-${stayId}-${externalActivityId}`;
    const r = await this.activities.reservePermit(externalActivityId, idempotencyKey);
    if (!r.ok) throw new ConflictError(`Could not reserve permit: ${r.reason}`);
    const a = r.data;

    return this.prisma.itineraryItem.create({
      data: {
        id: createId(),
        guestStayId: stayId,
        externalActivityId,
        day: a.day,
        startTime: a.startTime,
        endTime: a.endTime,
        title: a.title,
        location: a.location,
        status: 'booked',
        priceCents: a.priceCents,
      },
    });
  }

  async update(userId: string, itemId: string, data: { startTime?: string; notes?: string }) {
    const item = await this.prisma.itineraryItem.findUnique({
      where: { id: itemId },
      include: { stay: { select: { userId: true } } },
    });
    if (!item) throw new NotFoundError('Itinerary item not found');
    if (item.stay.userId !== userId) throw new ForbiddenError('Not your item');
    return this.prisma.itineraryItem.update({
      where: { id: itemId },
      data,
    });
  }

  async cancel(userId: string, itemId: string) {
    const item = await this.prisma.itineraryItem.findUnique({
      where: { id: itemId },
      include: { stay: { select: { userId: true } } },
    });
    if (!item) throw new NotFoundError('Itinerary item not found');
    if (item.stay.userId !== userId) throw new ForbiddenError('Not your item');
    return this.prisma.itineraryItem.update({
      where: { id: itemId },
      data: { status: 'cancelled' },
    });
  }
}
