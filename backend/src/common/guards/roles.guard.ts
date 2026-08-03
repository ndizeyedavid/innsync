import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenError } from '../errors/domain.errors';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Authorize the resolved user against role metadata on the route.
 * If no @Roles is declared, the guard is permissive (auth alone suffices).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user) throw new ForbiddenError('Authenticated user not resolved');
    if (!required.includes(user.role)) {
      throw new ForbiddenError(`Role ${user.role} cannot access this resource`);
    }
    return true;
  }
}
