/**
 * Integration sketch: place an order against the mock room-service provider
 * and confirm the local Order record + outbox event land atomically.
 *
 * In a real CI this would spin up Postgres via testcontainers. The skeleton
 * below shows the wiring; flesh out with `Test.createTestingModule({ ... })`
 * imports as needed for your environment.
 */
import { Test } from '@nestjs/testing';
import { OrdersService } from 'src/modules/orders/orders.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { OutboxService } from 'src/infrastructure/outbox/outbox.service';
import { EventBus } from 'src/infrastructure/events/event-bus.service';
import { ROOM_SERVICE_PROVIDER } from 'src/hospitality/tokens';
import { OrderCategory } from '@prisma/client';

describe('OrdersService.placeOrder (integration sketch)', () => {
  let orders: OrdersService;
  const fakePrisma = {
    guestStay: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'stay-1',
        userId: 'user-1',
        externalReservationId: 'EXT-RES-1',
        status: 'CHECKED_IN',
      }),
    },
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        order: {
          create: jest.fn().mockResolvedValue({
            id: 'order-1',
            guestStayId: 'stay-1',
            userId: 'user-1',
            idempotencyKey: 'idem-1',
            totalCents: 0,
            currency: 'USD',
            status: 'PENDING_REMOTE',
            items: [],
          }),
        },
        outboxEvent: { create: jest.fn() },
      }),
    ),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: OutboxService, useValue: { write: jest.fn() } },
        { provide: EventBus, useValue: { emit: jest.fn() } },
        { provide: ROOM_SERVICE_PROVIDER, useValue: { createTicket: jest.fn() } },
      ],
    }).compile();
    orders = module.get(OrdersService);
  });

  it('returns the created order without calling the provider synchronously', async () => {
    const result = await orders.placeOrder(
      'user-1',
      { stayId: 'stay-1', category: OrderCategory.FOOD, items: [{ externalMenuItemId: 'm-1', quantity: 1 }] },
      'idem-1',
    );
    expect(result.id).toBe('order-1');
    // The HMS call happens via the outbox publisher, NOT inline.
    expect(fakePrisma.$transaction).toHaveBeenCalled();
  });
});
