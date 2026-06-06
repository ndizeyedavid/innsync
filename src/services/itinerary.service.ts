import { itineraryEndpoints } from '../api/endpoints';
import { ItineraryItem } from '../api/types';

class ItineraryService {
  /**
   * Get itinerary for a specific stay
   */
  async getForStay(stayId: string): Promise<ItineraryItem[]> {
    try {
      return await itineraryEndpoints.list(stayId);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      throw error;
    }
  }

  /**
   * Book an activity
   */
  async bookActivity(stayId: string, activityId: string): Promise<void> {
    try {
      await itineraryEndpoints.bookActivity(activityId, stayId);
    } catch (error) {
      console.error('Error booking activity:', error);
      throw error;
    }
  }

  /**
   * Get scheduled items
   */
  async getScheduledItems(stayId: string): Promise<ItineraryItem[]> {
    const items = await this.getForStay(stayId);
    return items.filter(item => item.status === 'SCHEDULED');
  }

  /**
   * Get confirmed items
   */
  async getConfirmedItems(stayId: string): Promise<ItineraryItem[]> {
    const items = await this.getForStay(stayId);
    return items.filter(item => item.status === 'CONFIRMED');
  }

  /**
   * Get completed items
   */
  async getCompletedItems(stayId: string): Promise<ItineraryItem[]> {
    const items = await this.getForStay(stayId);
    return items.filter(item => item.status === 'COMPLETED');
  }
}

export default new ItineraryService();