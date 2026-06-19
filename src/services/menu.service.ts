import { menuEndpoints } from '../api/endpoints';
import { MenuItem } from '../api/types';

class MenuService {
  /**
   * Get all menu items
   */
  async list(category?: MenuItem['category']): Promise<MenuItem[]> {
    try {
      const result = await menuEndpoints.list(category);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching menu:', error);
      return [];
    }
  }

  /**
   * Get menu items by category
   */
  async getByCategory(category: MenuItem['category']): Promise<MenuItem[]> {
    return this.list(category);
  }

  /**
   * Get breakfast items
   */
  async getBreakfast(): Promise<MenuItem[]> {
    return this.list('BREAKFAST');
  }

  /**
   * Get lunch items
   */
  async getLunch(): Promise<MenuItem[]> {
    return this.list('LUNCH');
  }

  /**
   * Get dinner items
   */
  async getDinner(): Promise<MenuItem[]> {
    return this.list('DINNER');
  }

  /**
   * Get snack items
   */
  async getSnacks(): Promise<MenuItem[]> {
    return this.list('SNACKS');
  }

  /**
   * Get beverages
   */
  async getBeverages(): Promise<MenuItem[]> {
    return this.list('BEVERAGES');
  }

  /**
   * Get desserts
   */
  async getDesserts(): Promise<MenuItem[]> {
    return this.list('DESSERT');
  }
}

export default new MenuService();