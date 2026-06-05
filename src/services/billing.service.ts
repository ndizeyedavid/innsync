import { billingEndpoints } from '../api/endpoints';
import { Folio } from '../api/types';

class BillingService {
  /**
   * Get folio for a specific stay
   */
  async getFolio(stayId: string): Promise<Folio> {
    try {
      const response = await billingEndpoints.getFolio(stayId);
      return response.data;
    } catch (error) {
      console.error('Error fetching folio:', error);
      throw error;
    }
  }
}

export default new BillingService();