import * as Notifications from 'expo-notifications';
import { WarrantyItem } from '../types';
import { isExpired } from '../utils/itemUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleItemNotifications(item: WarrantyItem): Promise<void> {
  if (isExpired(item)) return;
  const leadDays = [30, 14, 7, 1];
  for (const days of leadDays) {
    const triggerDate = new Date(item.warrantyExpiration);
    triggerDate.setDate(triggerDate.getDate() - days);
    if (triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${item.id}-${days}d`,
      content: {
        title: days === 1 ? 'Warranty expires tomorrow' : `Warranty expires in ${days} days`,
        body: `${item.name}${item.retailer ? ` · ${item.retailer}` : ''} — tap to view details.`,
        data: { itemId: item.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  }
}

export async function cancelItemNotifications(item: WarrantyItem): Promise<void> {
  const ids = [30, 14, 7, 1].map(d => `${item.id}-${d}d`);
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export async function rescheduleAll(items: WarrantyItem[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const item of items) {
    if (!isExpired(item)) await scheduleItemNotifications(item);
  }
}
