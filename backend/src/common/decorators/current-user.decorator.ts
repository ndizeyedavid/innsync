import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  sub: string;       // user id
  role: Role;
  sessionId: string;
  jti: string;
}

/**
 * Extract the authenticated user from the request. Populated by JwtStrategy.
 *
 *   @Get('me')
 *   me(@CurrentUser() user: AuthenticatedUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    return req.user;
  },
);
