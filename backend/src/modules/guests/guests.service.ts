import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { GuestInfoDto } from './dto/guest-info.dto';
import { ForbiddenError, NotFoundError } from 'src/common/errors/domain.errors';

@Injectable()
export class GuestsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateGuestInfo(userId: string, stayId: string, dto: GuestInfoDto) {
    const stay = await this.prisma.guestStay.findUnique({ where: { id: stayId } });
    if (!stay) throw new NotFoundError('Stay not found');
    if (stay.userId !== userId) throw new ForbiddenError('Not your stay');

    return this.prisma.$transaction(async (tx) => {
      // Update the stay
      const updated = await tx.guestStay.update({
        where: { id: stayId },
        data: {
          checkIn: new Date(dto.checkIn),
          checkOut: new Date(dto.checkOut),
          nights: dto.nights,
          adults: dto.adults,
          children: dto.children,
          roomPreference: dto.roomPreference,
          bedPreference: dto.bedPreference,
          floorPreference: dto.floorPreference,
          mealPlan: dto.mealPlan,
          specialRequests: dto.specialRequests,
          itineraryVibes: dto.itineraryVibes,
          dietaryRestrictions: dto.dietaryRestrictions,
        },
      });
      // Also sync into the user's persistent profile so it survives beyond this stay
      await tx.guestProfile.update({
        where: { userId },
        data: {
          preferredVibes: dto.itineraryVibes,
          dietaryRestrictions: dto.dietaryRestrictions,
        },
      });
      return updated;
    });
  }
}
