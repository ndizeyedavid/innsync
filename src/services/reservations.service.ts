import { reservationEndpoints } from '../api/endpoints';
import { GuestStay, CreateStayDto } from '../api/types';

class ReservationsService {
  /**
   * Get all reservations for the current user
   */
  async listMine(): Promise<GuestStay[]> {
    try {
      return await reservationEndpoints.list();
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  /**
   * Create a new stay/reservation
   */
  async createStay(dto: CreateStayDto): Promise<GuestStay> {
    try {
      return await reservationEndpoints.create(dto);
    } catch (error) {
      console.error('Error creating stay:', error);
      throw error;
    }
  }

  /**
   * Get a specific reservation by ID
   */
  async getMine(reservationId: string): Promise<GuestStay> {
    try {
      return await reservationEndpoints.getOne(reservationId);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }
  }

  /**
   * Check in to a reservation
   */
  async checkIn(reservationId: string): Promise<void> {
    try {
      await reservationEndpoints.checkIn(reservationId);
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }
}

export default new ReservationsService();