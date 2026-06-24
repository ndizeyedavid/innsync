import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [PrismaModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
