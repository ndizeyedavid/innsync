import { loyaltyEndpoints } from "../api/endpoints";

class LoyaltyService {
  /**
   * Get current loyalty points
   */
  async getPoints(): Promise<any> {
    try {
      return await loyaltyEndpoints.getPoints();
    } catch (error) {
      console.error("Error fetching loyalty points:", error);
      throw error;
    }
  }

  /**
   * Get available rewards
   */
  async getRewards(): Promise<any[]> {
    try {
      const result = await loyaltyEndpoints.getRewards();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching rewards:", error);
      return [];
    }
  }
}

export default new LoyaltyService();
