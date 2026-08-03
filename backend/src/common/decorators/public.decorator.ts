import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'innsync:isPublic';
/**
 * Mark a route as not requiring authentication. JwtAuthGuard checks this
 * metadata and skips validation when present.
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
