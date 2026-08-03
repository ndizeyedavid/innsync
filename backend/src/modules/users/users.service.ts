import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ForbiddenError, NotFoundError } from 'src/common/errors/domain.errors';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      include: { guestProfile: true },
    });
    if (!u) throw new NotFoundError('User not found');
    return u;
  }

  async updateGuestProfile(userId: string, data: {
    dietaryRestrictions?: string[];
    preferredVibes?: string[];
    preferredLanguage?: string;
    preferredCurrency?: string;
    preferences?: Prisma.InputJsonValue;
  }) {
    return this.prisma.guestProfile.upsert({
      where: { userId },
      update: data,
      create: { id: userId, userId, ...data },
    });
  }

  async listSessions(userId: string) {
    return this.prisma.authSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        deviceLabel: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true,
        revokedAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.authSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundError('Session not found');
    if (session.userId !== userId) throw new ForbiddenError('Not your session');
    if (session.revokedAt) return { alreadyRevoked: true };
    return this.prisma.authSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }
}
