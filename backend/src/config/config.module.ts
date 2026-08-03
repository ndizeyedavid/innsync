import { Global, Module } from '@nestjs/common';
import { AppConfig } from './configuration';

/**
 * Makes AppConfig injectable everywhere without each feature module having
 * to declare it as a provider.
 */
@Global()
@Module({
  providers: [AppConfig],
  exports: [AppConfig],
})
export class AppConfigModule {}
