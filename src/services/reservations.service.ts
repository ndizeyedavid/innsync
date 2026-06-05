import { reservationEndpoints } from '../api/endpoints';
import { Reservation, CreateStayDto } from '../api/types';

class ReservationsService {
  /**
   * Get all reservations for the current user
   */
  async listMine(): Promise<Reservation[]> {
    try {
      const response = await reservationEndpoints.list();
      return response.data;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  /**
   * Create a new stay/reservation
   */
  async createStay(dto: CreateStayDto): Promise<Reservation> {
    try {
      const response = await reservationEndpoints.create(dto);
      return response.data;
    } catch (error) {
      console.error('Error creating stay:', error);
      throw error;
    }
  }

  /**
   * Get a specific reservation by ID
   */
  async getMine(reservationId: string): Promise<Reservation> {
    try {
      const response = await reservationEndpoints.getOne(reservationId);
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }
  }

  /**
   * Check in to a reservation
   */
  async checkIn(reservationId: string): Promise<Reservation> {
    try {
      const response = await reservationEndpoints.checkIn(reservationId);
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }
}

export default new ReservationsService();