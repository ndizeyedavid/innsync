import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/common/errors/domain.errors';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

export interface MenuItem {
  id: string;
  category: 'food' | 'drinks' | 'activities' | 'room-service' | 'housekeeping';
  name: string;
  description: string;
  priceCents: number;
  image: string;
  prepMinutes: number;
  tags?: string[];
}

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async list(hotelId: string, category?: MenuItem['category']): Promise<MenuItem[]> {
    const where: any = { hotelId };
    if (category) where.category = category;
    return this.prisma.menuItem.findMany({ where, orderBy: { createdAt: 'asc' } }) as any;
  }

  async getById(hotelId: string, id: string): Promise<MenuItem> {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item || item.hotelId !== hotelId) throw new NotFoundError(`Menu item ${id} not found`);
    return item as any;
  }

  async getMany(ids: string[]): Promise<MenuItem[]> {
    const items = await this.prisma.menuItem.findMany({ where: { id: { in: ids } } });
    return items as any;
  }
}
