import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from 'src/config/configuration';
import { DigitalKeyController } from './digital-key.controller';
import { DigitalKeyGateway } from './digital-key.gateway';
import { DigitalKeyService } from './digital-key.service';

@Module({
  controllers: [DigitalKeyController],
  providers: [DigitalKeyService, DigitalKeyGateway, JwtService, AppConfig],
})
export class DigitalKeyModule {}
