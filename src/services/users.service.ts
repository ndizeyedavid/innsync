import { userEndpoints } from "../api/endpoints";
import { AuthSession } from "../api/types";

class UsersService {
  /**
   * Get login history (sessions)
   */
  async getLoginHistory(): Promise<AuthSession[]> {
    try {
      const result = await userEndpoints.getLoginHistory();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching login history:", error);
      return [];
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await userEndpoints.revokeSession(sessionId);
    } catch (error) {
      console.error("Error revoking session:", error);
      throw error;
    }
  }
}

export default new UsersService();
