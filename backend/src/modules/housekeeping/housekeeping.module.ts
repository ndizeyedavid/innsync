import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from 'src/config/configuration';
import { HousekeepingController } from './housekeeping.controller';
import { GuestHousekeepingController } from './guest-housekeeping.controller';
import { HousekeepingGateway } from './housekeeping.gateway';
import { HousekeepingService } from './housekeeping.service';

@Module({
  controllers: [HousekeepingController, GuestHousekeepingController],
  providers: [HousekeepingService, HousekeepingGateway, JwtService, AppConfig],
  exports: [HousekeepingService],
})
export class HousekeepingModule {}
