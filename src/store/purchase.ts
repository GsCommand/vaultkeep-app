import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNLOCK_KEY = 'vaultkeep_unlocked';
const PRODUCT_ID = Platform.select({
  ios: 'com.vaultkeep.app.lifetime',
  android: 'vaultkeep_lifetime',
}) ?? 'com.vaultkeep.app.lifetime';

// In production, replace this stub with react-native-iap or expo-iap
// For now this gives us the full purchase flow structure

export async function checkPurchase(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(UNLOCK_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function savePurchase(): Promise<void> {
  await AsyncStorage.setItem(UNLOCK_KEY, 'true');
}

export async function clearPurchase(): Promise<void> {
  await AsyncStorage.removeItem(UNLOCK_KEY);
}

export { PRODUCT_ID };
