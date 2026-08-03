import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'innsync:roles';

/**
 * Restrict a route to one or more roles. Combine with the JwtAuthGuard so
 * that authentication has already resolved request.user before RolesGuard runs.
 *
 *   @Roles('STAFF', 'ADMIN')
 *   @Get(':id')
 *   adminOnly() { ... }
 */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
