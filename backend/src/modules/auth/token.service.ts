import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { createHash, randomBytes } from 'crypto';
import { createId } from '@paralleldrive/cuid2';
import { Role } from '@prisma/client';
import { AppConfig } from 'src/config/configuration';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UnauthorizedError } from 'src/common/errors/domain.errors';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
  sessionId: string;
}

/**
 * Centralizes issuance, rotation, and revocation logic so AuthService stays
 * focused on use-cases, not crypto details.
 *
 * Storage strategy:
 *   - Access tokens are stateless JWTs.
 *   - Refresh tokens are opaque random strings. We persist a SHA-256 hash
 *     (never the raw value). On refresh we hash the presented token and
 *     look it up.
 *   - Rotation: refresh tokens are single-use. Each refresh marks the old
 *     row revoked and links it via `replacedById` to the new row. Reuse
 *     detection: if we see a revoked-but-presented token, we revoke the
 *     entire session (token theft response).
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
    private readonly prisma: PrismaService,
  ) {}

  async issueForLogin(input: {
    userId: string;
    role: Role;
    sessionId: string;
  }): Promise<IssuedTokens> {
    const jti = createId();
    const now = Date.now();
    const accessExpiresAt = new Date(now + this.parseTtlMs(this.config.jwt.accessTtl));
    const refreshExpiresAt = new Date(now + this.parseTtlMs(this.config.jwt.refreshTtl));

    const accessToken = await this.jwt.signAsync(
      { sub: input.userId, role: input.role, sessionId: input.sessionId, jti },
      {
        secret: this.config.jwt.accessSecret,
        algorithm: this.config.jwt.algorithm,
        expiresIn: this.config.jwt.accessTtl as StringValue,
      },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        id: createId(),
        sessionId: input.sessionId,
        userId: input.userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      sessionId: input.sessionId,
    };
  }

  /**
   * Rotate a refresh token. Returns the new token pair on success.
   * Throws UnauthorizedError on any anomaly (expired, unknown, revoked).
   * Detects reuse: a revoked-but-presented token revokes all session tokens.
   */
  async rotate(refreshToken: string): Promise<IssuedTokens> {
    const tokenHash = hashToken(refreshToken);
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true, session: true },
    });
    if (!row) throw new UnauthorizedError('Invalid refresh token');
    if (row.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired');

    if (row.revokedAt) {
      // Reuse attack — burn the whole session.
      await this.prisma.refreshToken.updateMany({
        where: { sessionId: row.sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Refresh token reuse detected; session terminated');
    }
    if (row.session.revokedAt) throw new UnauthorizedError('Session revoked');

    // Issue the new pair AND revoke the old row in one transaction so
    // there's no window where both are valid.
    return this.prisma.$transaction(async (tx) => {
      const issued = await this.issueForLogin({
        userId: row.userId,
        role: row.user.role,
        sessionId: row.sessionId,
      });
      // Link rotation chain
      const newRow = await tx.refreshToken.findUnique({
        where: { tokenHash: hashToken(issued.refreshToken) },
      });
      await tx.refreshToken.update({
        where: { id: row.id },
        data: { revokedAt: new Date(), replacedById: newRow?.id },
      });
      return issued;
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.authSession.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private parseTtlMs(ttl: string): number {
    const m = ttl.match(/^(\d+)(s|m|h|d)$/);
    if (!m) throw new Error(`Invalid TTL: ${ttl}`);
    const n = parseInt(m[1]!, 10);
    const unit = m[2];
    const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit!]!;
    return n * multiplier;
  }
}

function hashToken(t: string): string {
  return createHash('sha256').update(t).digest('hex');
}
