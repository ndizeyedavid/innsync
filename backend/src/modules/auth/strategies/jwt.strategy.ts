import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from 'src/config/configuration';
import { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

/**
 * Validates access tokens on every request. We do NOT hit the DB per call;
 * the token's claims are sufficient. Refresh-time checks revoke if needed.
 *
 * Claim shape:
 *   sub        — user id
 *   role       — Role enum value
 *   sessionId  — links to AuthSession; used at refresh time
 *   jti        — JWT id; useful for tracing
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: AppConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
      algorithms: [config.jwt.algorithm],
    });
  }

  async validate(payload: {
    sub: string;
    role: Role;
    sessionId: string;
    jti: string;
  }): Promise<AuthenticatedUser> {
    return {
      sub: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId,
      jti: payload.jti,
    };
  }
}
