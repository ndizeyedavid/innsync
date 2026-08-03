import { notificationEndpoints } from "../api/endpoints";
import { Notification } from "../api/types";

class NotificationsService {
  /**
   * List all notifications for current user
   */
  async listMine(): Promise<Notification[]> {
    try {
      const result = await notificationEndpoints.list();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await notificationEndpoints.markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
}

export default new NotificationsService();
