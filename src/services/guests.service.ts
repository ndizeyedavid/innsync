import { guestEndpoints } from '../api/endpoints';
import { GuestInfoDto, GuestStay } from '../api/types';

class GuestsService {
  /**
   * Submit guest information for a stay
   */
  async updateGuestInfo(stayId: string, dto: GuestInfoDto): Promise<GuestStay> {
    try {
      return await guestEndpoints.submitGuestInfo(stayId, dto);
    } catch (error) {
      console.error('Error updating guest info:', error);
      throw error;
    }
  }
}

export default new GuestsService();