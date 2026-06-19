import { Platform } from 'react-native';
import { getDeviceId } from './storage';

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  osVersion: string;
  model?: string;
  manufacturer?: string;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const deviceId = await getDeviceId();
    
    return {
      deviceId,
      platform: Platform.OS,
      osVersion: Platform.Version as string,
      // Additional device info could be added here using expo-device if needed
      model: undefined,
      manufacturer: undefined,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    // Return minimal info if there's an error
    return {
      deviceId: 'unknown',
      platform: Platform.OS,
      osVersion: Platform.Version as string,
    };
  }
}

export async function getUserAgent(): Promise<string> {
  try {
    const deviceInfo = await getDeviceInfo();
    return `InnSync/${deviceInfo.platform} ${deviceInfo.osVersion} (${deviceInfo.deviceId})`;
  } catch (error) {
    console.error('Error getting user agent:', error);
    return 'InnSync/Unknown';
  }
}