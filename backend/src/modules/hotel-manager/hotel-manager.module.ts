import { Module } from '@nestjs/common';
import { HotelManagerService } from './hotel-manager.service';
import { HotelManagerController } from './hotel-manager.controller';
import { AdminAuthController } from './admin-auth.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { EventsModule } from 'src/infrastructure/events/events.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { MenuModule } from 'src/modules/menu/menu.module';

@Module({
  imports: [PrismaModule, EventsModule, AuthModule, NotificationsModule, MenuModule],
  providers: [HotelManagerService],
  controllers: [HotelManagerController, AdminAuthController],
})
export class HotelManagerModule {}
