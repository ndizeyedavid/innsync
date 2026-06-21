import { roomEndpoints } from "../api/endpoints";

class RoomsService {
  /**
   * List rooms for a stay
   */
  async listForStay(stayId: string): Promise<any[]> {
    try {
      const result = await roomEndpoints.list(stayId);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  }
}

export default new RoomsService();
