import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Role } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../errors/domain.errors';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Resource-scoped authorization for routes that take a `:stayId` (or `:id`
 * on stay-rooted controllers). Guests may only operate on their own stays.
 * STAFF / CONCIERGE / ADMIN bypass this check.
 *
 * Implementation note: we read from request params so this works on any
 * controller that follows the `:stayId` convention.
 */
@Injectable()
export class StayOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params: Record<string, string>;
    }>();
    const user = req.user;
    if (!user) throw new ForbiddenError('Unauthenticated');
    if (user.role !== Role.GUEST) return true;

    const stayId = req.params.stayId ?? req.params.id;
    if (!stayId) return true; // nothing to scope; let other guards/policies decide
    const stay = await this.prisma.guestStay.findUnique({
      where: { id: stayId },
      select: { userId: true },
    });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== user.sub) throw new ForbiddenError('Not your stay');
    return true;
  }
}
