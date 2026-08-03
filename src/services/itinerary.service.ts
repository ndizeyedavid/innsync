import { itineraryEndpoints } from '../api/endpoints';
import { ItineraryItem } from '../api/types';

class ItineraryService {
  /**
   * Get itinerary for a specific stay
   */
  async getForStay(stayId: string): Promise<ItineraryItem[]> {
    try {
      const result = await itineraryEndpoints.list(stayId);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      return [];
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
    return items.filter(item => item.status === 'booked');
  }

  /**
   * Get confirmed items
   */
  async getConfirmedItems(stayId: string): Promise<ItineraryItem[]> {
    const items = await this.getForStay(stayId);
    return items.filter(item => item.status === 'booked');
  }

  /**
   * Get completed items
   */
  async getCompletedItems(stayId: string): Promise<ItineraryItem[]> {
    const items = await this.getForStay(stayId);
    return items.filter(item => item.status === 'completed');
  }
}

export default new ItineraryService();