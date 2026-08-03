import { recommendationEndpoints } from "../api/endpoints";

class RecommendationsService {
  /**
   * Get personalized recommendations for a stay
   */
  async getPersonalized(stayId: string): Promise<any[]> {
    try {
      const result = await recommendationEndpoints.getPersonalized(stayId);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      return [];
    }
  }

  /**
   * Get popular recommendations
   */
  async getPopular(): Promise<any[]> {
    try {
      const result = await recommendationEndpoints.getPopular();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching popular recommendations:", error);
      return [];
    }
  }
}

export default new RecommendationsService();
