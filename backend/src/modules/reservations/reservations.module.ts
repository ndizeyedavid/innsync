import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationReconciler } from 'src/hospitality/reconciliation/reservation-reconciler.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationReconciler],
  exports: [ReservationsService],
})
export class ReservationsModule {}
