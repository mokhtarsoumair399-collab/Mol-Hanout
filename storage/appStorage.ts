import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '../utils/types';
import { defaultDebtReminderSettings } from '../utils/factories';

const CUSTOMERS_STORAGE_KEY = 'mol-hanout-customers';

export async function loadCustomers(): Promise<Customer[]> {
  const rawValue = await AsyncStorage.getItem(CUSTOMERS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  const parsedCustomers = JSON.parse(rawValue) as Customer[];
  return parsedCustomers.map((customer) => ({
    ...customer,
    debtReminderSettings: {
      ...defaultDebtReminderSettings,
      ...customer.debtReminderSettings,
    },
  }));
}

export async function saveCustomers(customers: Customer[]) {
  await AsyncStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
}
