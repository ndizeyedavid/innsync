import { digitalKeyEndpoints } from '../api/endpoints';
import { UnlockDto, VerifyPinDto } from '../api/types';

class DigitalKeyService {
  /**
   * Record an unlock attempt
   */
  async recordUnlock(dto: UnlockDto): Promise<void> {
    try {
      await digitalKeyEndpoints.unlock(dto);
    } catch (error) {
      console.error('Error recording unlock:', error);
      throw error;
    }
  }

  /**
   * Verify PIN for digital key
   */
  async verifyPin(dto: VerifyPinDto): Promise<boolean> {
    try {
      const response = await digitalKeyEndpoints.verifyPin(dto);
      return response.data.ok;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw error;
    }
  }

  /**
   * Record successful tap unlock
   */
  async recordTapUnlock(digitalKeyId: string): Promise<void> {
    return this.recordUnlock({
      digitalKeyId,
      method: 'BLE',
      result: 'SUCCESS',
    });
  }

  /**
   * Record failed tap unlock
   */
  async recordFailedTapUnlock(digitalKeyId: string): Promise<void> {
    return this.recordUnlock({
      digitalKeyId,
      method: 'BLE',
      result: 'FAILED',
    });
  }

  /**
   * Record cancelled tap unlock
   */
  async recordCancelledTapUnlock(digitalKeyId: string): Promise<void> {
    return this.recordUnlock({
      digitalKeyId,
      method: 'BLE',
      result: 'TIMEOUT',
    });
  }
}

export default new DigitalKeyService();