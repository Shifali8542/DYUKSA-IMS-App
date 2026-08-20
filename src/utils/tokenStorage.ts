import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getWorkspaceId(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
  },

  async setTokens(access: string, refresh: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, access],
      [STORAGE_KEYS.REFRESH_TOKEN, refresh],
    ]);
  },

  async setAccessToken(access: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  },

  async setWorkspaceId(id: string | number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, String(id));
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.WORKSPACE_ID,
    ]);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },
};