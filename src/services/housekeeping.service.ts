import { housekeepingEndpoints } from "../api/endpoints";

class HousekeepingService {
  /**
   * Request housekeeping service
   */
  async requestService(stayId: string, type: string, notes?: string): Promise<void> {
    try {
      await housekeepingEndpoints.requestService(stayId, type, notes);
    } catch (error) {
      console.error("Error requesting housekeeping:", error);
      throw error;
    }
  }

  /**
   * Get housekeeping status for a stay
   */
  async getStatus(stayId: string): Promise<any> {
    try {
      return await housekeepingEndpoints.getStatus(stayId);
    } catch (error) {
      console.error("Error fetching housekeeping status:", error);
      throw error;
    }
  }
}

export default new HousekeepingService();
