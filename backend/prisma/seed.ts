/**
 * Seed script — populates a fresh local DB with a demo guest, an active stay,
 * a few orders, and some loyalty history. Idempotent: rerunning is safe.
 *
 * Usage:  pnpm prisma:seed
 */
import { PrismaClient, Role, LoyaltyTier, StayStatus, OrderStatus, OrderCategory } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('demo-password', { type: argon2.argon2id });

  // Demo guest user
  const userId = await prisma.user
    .upsert({
      where: { email: 'demo@innsync.dev' },
      update: {},
      create: {
        id: createId(),
        email: 'demo@innsync.dev',
        phone: '+15555550100',
        name: 'Avery Chen',
        passwordHash,
        role: Role.GUEST,
        emailVerified: new Date(),
        guestProfile: {
          create: {
            id: createId(),
            loyaltyTier: LoyaltyTier.GOLD,
            loyaltyPoints: 4820,
            preferredVibes: ['wellness', 'fine-dining', 'photography'],
            dietaryRestrictions: ['vegetarian'],
          },
        },
      },
    })
    .then((u) => u.id);

  // Staff user
  await prisma.user.upsert({
    where: { email: 'staff@innsync.dev' },
    update: {},
    create: {
      id: createId(),
      email: 'staff@innsync.dev',
      name: 'Concierge Bot',
      passwordHash,
      role: Role.CONCIERGE,
    },
  });

  // Active stay
  const now = new Date();
  const checkIn = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const checkOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const stayId = await prisma.guestStay
    .upsert({
      where: { id: 'seed-stay-001' },
      update: {},
      create: {
        id: 'seed-stay-001',
        userId,
        hotelId: 'demo-hotel',
        externalReservationId: 'MOCK-RES-001',
        status: StayStatus.CHECKED_IN,
        checkIn,
        checkOut,
        nights: 4,
        adults: 2,
        children: 0,
        mealPlan: 'breakfast',
        itineraryVibes: ['wellness', 'fine-dining'],
        dietaryRestrictions: ['vegetarian'],
        onboardingCompleted: true,
        paymentAuthorized: true,
        idUploaded: true,
        carbonOffset: true,
        selectedRoomId: 'ROOM-ocean-suite',
      },
    })
    .then((s) => s.id);

  // A delivered order from yesterday (history)
  await prisma.order.upsert({
    where: { idempotencyKey: 'seed-order-history-001' },
    update: {},
    create: {
      id: createId(),
      guestStayId: stayId,
      userId,
      idempotencyKey: 'seed-order-history-001',
      status: OrderStatus.DELIVERED,
      category: OrderCategory.FOOD,
      totalCents: 4200,
      currency: 'USD',
      etaMinutes: 25,
      externalTicketId: 'MOCK-TKT-001',
      deliveredAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      items: {
        create: [
          {
            id: createId(),
            externalMenuItemId: 'menu-burrata',
            nameSnapshot: 'Burrata garden plate',
            quantity: 1,
            unitPriceCents: 2400,
            prepMinutes: 15,
          },
          {
            id: createId(),
            externalMenuItemId: 'menu-iced-matcha',
            nameSnapshot: 'Iced matcha',
            quantity: 2,
            unitPriceCents: 900,
            prepMinutes: 5,
          },
        ],
      },
    },
  });

  // Loyalty ledger
  await prisma.loyaltyLedgerEntry.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-ll-001',
        userId,
        pointsDelta: 320,
        reason: 'stay',
        relatedStayId: stayId,
      },
      {
        id: 'seed-ll-002',
        userId,
        pointsDelta: 42,
        reason: 'order',
      },
    ],
  });

  // A reservation cache snapshot — what we'd have fetched from the HMS
  await prisma.reservationCache.upsert({
    where: { externalId: 'MOCK-RES-001' },
    update: {},
    create: {
      externalId: 'MOCK-RES-001',
      snapshot: {
        externalId: 'MOCK-RES-001',
        hotelId: 'demo-hotel',
        guestExternalId: 'GUEST-001',
        status: 'CHECKED_IN',
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        roomExternalId: 'ROOM-ocean-suite',
        totalCents: 132000,
        currency: 'USD',
      },
    },
  });

  // Feature flags
  await prisma.featureFlag.upsert({
    where: { key: 'orders.realtime.websockets' },
    update: { enabled: true },
    create: { key: 'orders.realtime.websockets', enabled: true, rolloutPercent: 100 },
  });
  await prisma.featureFlag.upsert({
    where: { key: 'checkout.express' },
    update: { enabled: true },
    create: { key: 'checkout.express', enabled: true, rolloutPercent: 100 },
  });

  // Room cache entries
  const rooms = [
    { id: 'ROOM-ocean-suite-1', number: '101', type: 'Ocean Suite', price: 45000 },
    { id: 'ROOM-ocean-suite-2', number: '102', type: 'Ocean Suite', price: 45000 },
    { id: 'ROOM-garden-view-1', number: '201', type: 'Garden View', price: 30000 },
    { id: 'ROOM-garden-view-2', number: '202', type: 'Garden View', price: 30000 },
    { id: 'ROOM-standard-1', number: '301', type: 'Standard', price: 20000 },
    { id: 'ROOM-standard-2', number: '302', type: 'Standard', price: 20000 },
  ];

  for (const room of rooms) {
    await prisma.roomCache.upsert({
      where: { externalId: room.id },
      update: {},
      create: {
        externalId: room.id,
        hotelId: 'demo-hotel',
        snapshot: room,
      },
    });
  }

  console.log('Seed complete. Demo guest: demo@innsync.dev / demo-password');
  console.log('Demo staff: staff@innsync.dev / demo-password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
