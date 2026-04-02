import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '../utils/types';

const CUSTOMERS_STORAGE_KEY = 'mol-hanout-customers';

export async function loadCustomers(): Promise<Customer[]> {
  const rawValue = await AsyncStorage.getItem(CUSTOMERS_STORAGE_KEY);
  return rawValue ? (JSON.parse(rawValue) as Customer[]) : [];
}

export async function saveCustomers(customers: Customer[]) {
  await AsyncStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
}
