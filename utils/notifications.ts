import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getCustomerBalance } from './balance';
import { formatCurrency } from './formatters';
import { Customer } from './types';

const DEBT_NOTIFICATION_KIND = 'customer-debt';
const DEBT_NOTIFICATION_CHANNEL_ID = 'debt-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestDebtNotificationPermission() {
  if (Platform.OS === 'web') {
    return false;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  if (hasGrantedNotificationPermission(currentPermissions)) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return hasGrantedNotificationPermission(requestedPermissions);
}

export async function syncDebtNotifications(customers: Customer[]) {
  if (Platform.OS === 'web') {
    return;
  }

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const debtNotifications = scheduledNotifications.filter(
    (notification) => notification.content.data?.kind === DEBT_NOTIFICATION_KIND,
  );

  await Promise.all(
    debtNotifications.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier),
    ),
  );

  await ensureDebtNotificationChannel();

  const customersWithActiveReminders = customers.filter((customer) => {
    return customer.debtReminderSettings.enabled && getCustomerBalance(customer) > 0;
  });

  await Promise.all(
    customersWithActiveReminders.map((customer) => {
      return Notifications.scheduleNotificationAsync({
        content: buildDebtNotificationContent(customer),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: customer.debtReminderSettings.hour,
          minute: customer.debtReminderSettings.minute,
        },
      });
    }),
  );
}

export async function sendDebtReminderTestNotification(customer: Customer) {
  if (Platform.OS === 'web') {
    return false;
  }

  await ensureDebtNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: buildDebtNotificationContent(customer),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      repeats: false,
    },
  });

  return true;
}

function buildDebtNotificationContent(customer: Customer) {
  const balance = Math.max(getCustomerBalance(customer), 0);

  return {
    title: `🔔 تذكير بالدين - ${customer.name}`,
    body: `على ${customer.name} دين حالي قدره ${formatCurrency(balance)}. افتح التطبيق لمراجعة الحساب أو إرسال التذكير.`,
    sound: true,
    ...(Platform.OS === 'android' ? { channelId: DEBT_NOTIFICATION_CHANNEL_ID } : {}),
    data: {
      kind: DEBT_NOTIFICATION_KIND,
      customerId: customer.id,
    },
  };
}

function hasGrantedNotificationPermission(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  if (permissions.granted) {
    return true;
  }

  if (Platform.OS === 'ios') {
    const iosStatus = permissions.ios?.status;
    return (
      iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }

  return false;
}

async function ensureDebtNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEBT_NOTIFICATION_CHANNEL_ID, {
    name: 'Debt reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}
