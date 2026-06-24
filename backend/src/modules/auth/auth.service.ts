import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { createId } from '@paralleldrive/cuid2';
import { randomBytes, createHash } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AppConfig } from 'src/config/configuration';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'src/common/errors/domain.errors';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { TokenService } from './token.service';
import { EmailService } from '../email/email.service';

/**
 * AuthService — sign-up, sign-in, refresh, sign-out.
 *
 * No HTTP details: the controller adapts request/response. This service can
 * be tested with a minimal Prisma + TokenService double.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly config: AppConfig,
    private readonly email: EmailService,
  ) {
    this.googleClient = new OAuth2Client(this.config.googleClientId);
  }

  async googleSignIn(dto: GoogleSignInDto, deviceInfo: { ip?: string; userAgent?: string }) {
    let payload: { sub: string; email?: string; name?: string; picture?: string };
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: this.config.googleClientId,
      });
      payload = ticket.getPayload()!;
    } catch {
      throw new UnauthorizedError('Invalid Google ID token');
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name || 'Guest';

    if (!email) {
      throw new UnauthorizedError('Google account has no email');
    }

    // Find existing user by googleId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
        deletedAt: null,
      },
    });

    if (user) {
      // Link googleId if user exists but wasn't logged in via Google before
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      // Create new user
      const randomPassword = createId() + randomBytes(16).toString('hex');
      const passwordHash = await argon2.hash(randomPassword, {
        type: argon2.argon2id,
        memoryCost: this.config.argon2.memoryCost,
        timeCost: this.config.argon2.timeCost,
      });

      user = await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            id: createId(),
            email,
            googleId,
            name,
            passwordHash,
            role: Role.GUEST,
            guestProfile: { create: { id: createId() } },
          },
        });
        return u;
      });
    }

    return this.startSession(user.id, user.role, { ...deviceInfo, deviceLabel: dto.deviceLabel });
  }

  async signUp(dto: SignUpDto, deviceInfo: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, dto.phone ? { phone: dto.phone } : {}] },
    });
    if (existing) throw new ConflictError('Email or phone already in use');

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: this.config.argon2.memoryCost,
      timeCost: this.config.argon2.timeCost,
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          id: createId(),
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          name: dto.name,
          passwordHash,
          role: Role.GUEST,
          guestProfile: { create: { id: createId() } },
        },
      });
      return u;
    });

    return this.startSession(user.id, user.role, { ...deviceInfo, deviceLabel: dto.deviceLabel });
  }

  async signIn(dto: SignInDto, deviceInfo: { ip?: string; userAgent?: string }) {
    if (!dto.email && !dto.phone) {
      throw new ValidationError('Email or phone required');
    }
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email.toLowerCase() } : {},
          dto.phone ? { phone: dto.phone } : {},
        ],
        deletedAt: null,
      },
    });
    if (!user) {
      // Generic message — never leak which identifier exists
      throw new UnauthorizedError('Invalid credentials');
    }
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    return this.startSession(user.id, user.role, { ...deviceInfo, deviceLabel: dto.deviceLabel });
  }

  async refresh(refreshToken: string) {
    return this.tokens.rotate(refreshToken);
  }

  async signOut(sessionId: string): Promise<void> {
    await this.tokens.revokeSession(sessionId);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { guestProfile: true },
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      this.logger.warn(`Password reset requested for unknown email: ${email}`);
      return;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 3_600_000);

    await this.prisma.passwordResetToken.create({
      data: { id: createId(), userId: user.id, tokenHash, expiresAt },
    });

    await this.email.sendPasswordReset(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const row = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!row) throw new UnauthorizedError('Invalid or expired reset token');
    if (row.usedAt) throw new UnauthorizedError('Token already used');
    if (row.expiresAt < new Date()) throw new UnauthorizedError('Token expired');

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: this.config.argon2.memoryCost,
      timeCost: this.config.argon2.timeCost,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, phone: true, name: true, role: true, createdAt: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    const ok = await argon2.verify(user.passwordHash, currentPassword);
    if (!ok) throw new UnauthorizedError('Current password is incorrect');
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: this.config.argon2.memoryCost,
      timeCost: this.config.argon2.timeCost,
    });
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.authSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  // ─── helpers ──────────────────────────────────────────────────────

  private async startSession(
    userId: string,
    role: Role,
    info: { ip?: string; userAgent?: string; deviceLabel?: string },
  ) {
    const sessionId = createId();
    await this.prisma.authSession.create({
      data: {
        id: sessionId,
        userId,
        deviceLabel: info.deviceLabel,
        ip: info.ip,
        userAgent: info.userAgent,
      },
    });
    const tokens = await this.tokens.issueForLogin({ userId, role, sessionId });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, name: true, role: true },
    });
    return { tokens, user };
  }
}
