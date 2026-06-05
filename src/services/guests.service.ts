import { guestEndpoints } from '../api/endpoints';
import { GuestInfo } from '../api/types';

class GuestsService {
  /**
   * Submit guest information for a stay
   */
  async updateGuestInfo(stayId: string, dto: GuestInfo): Promise<GuestInfo> {
    try {
      const response = await guestEndpoints.submitGuestInfo(stayId, dto);
      return response.data;
    } catch (error) {
      console.error('Error updating guest info:', error);
      throw error;
    }
  }
}

export default new GuestsService();