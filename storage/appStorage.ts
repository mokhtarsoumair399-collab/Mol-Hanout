import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppBackupData, Customer, InventoryItem } from '../utils/types';
import { defaultDebtReminderSettings, defaultWhatsAppAutoMessageSettings } from '../utils/factories';

const CUSTOMERS_STORAGE_KEY = 'mol-hanout-customers';
const INVENTORY_STORAGE_KEY = 'mol-hanout-inventory';

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
    whatsAppAutoMessageSettings: {
      ...defaultWhatsAppAutoMessageSettings,
      ...customer.whatsAppAutoMessageSettings,
    },
  }));
}

export async function saveCustomers(customers: Customer[]) {
  await AsyncStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
}

export async function loadInventory(): Promise<InventoryItem[]> {
  const rawValue = await AsyncStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  return JSON.parse(rawValue) as InventoryItem[];
}

export async function saveInventory(inventory: InventoryItem[]) {
  await AsyncStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
}

export function serializeAppBackupData(data: AppBackupData) {
  return JSON.stringify(data, null, 2);
}

export function parseAppBackupData(payload: string): AppBackupData {
  const parsed = JSON.parse(payload) as Partial<AppBackupData>;
  if (!parsed || !Array.isArray(parsed.customers) || !Array.isArray(parsed.inventory)) {
    throw new Error('Invalid backup data');
  }

  const customers = (parsed.customers as Customer[]).map((customer) => ({
    ...customer,
    debtReminderSettings: {
      ...defaultDebtReminderSettings,
      ...customer.debtReminderSettings,
    },
    whatsAppAutoMessageSettings: {
      ...defaultWhatsAppAutoMessageSettings,
      ...customer.whatsAppAutoMessageSettings,
    },
  }));

  return {
    version: parsed.version === '1' ? '1' : '1',
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    customers,
    inventory: parsed.inventory as InventoryItem[],
  };
}
