import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'src/common/errors/domain.errors';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search?: string, city?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (city) {
      where.address = { contains: city, mode: 'insensitive' };
    }
    return this.prisma.hotel.findMany({ where, orderBy: { name: 'asc' } });
  }

  async getOne(id: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new NotFoundError('Hotel not found');
    return hotel;
  }

  async getRooms(hotelId: string) {
    return this.prisma.room.findMany({ where: { hotelId }, orderBy: { type: 'asc' } });
  }
}
