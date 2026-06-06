import { orderEndpoints } from "../api/endpoints";
import { PlaceOrderDto, Order, OrderResponseDto } from "../api/types";
// import { createId } from '@paralleldrive/cuid2';

class OrdersService {
  /**
   * Place a new order
   */
  async placeOrder(dto: PlaceOrderDto): Promise<OrderResponseDto> {
    try {
      // Generate idempotency key for this order
      const idempotencyKey = Number(
        Math.floor(Math.random()) * 1000000,
      ).toString();
      const response = await orderEndpoints.place(dto, idempotencyKey);
      return response.data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }

  /**
   * List orders for the current user
   */
  async listMine(params?: {
    status?: "active" | "all";
    limit?: number;
  }): Promise<OrderResponseDto[]> {
    try {
      const response = await orderEndpoints.list(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: string): Promise<OrderResponseDto> {
    try {
      const response = await orderEndpoints.getOne(orderId);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  /**
   * Get active orders
   */
  async getActiveOrders(): Promise<OrderResponseDto[]> {
    return this.listMine({ status: "active", limit: 20 });
  }

  /**
   * Get all orders
   */
  async getAllOrders(limit: number = 20): Promise<OrderResponseDto[]> {
    return this.listMine({ status: "all", limit });
  }
}

export default new OrdersService();
