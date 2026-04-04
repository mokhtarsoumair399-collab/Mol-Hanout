import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { seedCustomers, seedInventory } from '../storage/demoData';
import { loadCustomers, saveCustomers } from '../storage/appStorage';
import { defaultDebtReminderSettings } from '../utils/factories';
import {
  requestDebtNotificationPermission,
  sendDebtReminderTestNotification,
  syncDebtNotifications,
} from '../utils/notifications';
import {
  Customer,
  CustomerInput,
  DebtReminderSettings,
  Transaction,
  TransactionInput,
  InventoryItem,
  InventoryInput,
  WhatsAppAutoMessageSettings,
} from '../utils/types';
import { createCustomer, createTransaction } from '../utils/factories';

type AppContextValue = {
  customers: Customer[];
  inventory: InventoryItem[];
  loading: boolean;
  addCustomer: (input: CustomerInput) => void;
  updateCustomer: (customerId: string, input: CustomerInput) => void;
  deleteCustomer: (customerId: string) => void;
  addTransaction: (customerId: string, input: TransactionInput) => void;
  deleteTransaction: (customerId: string, transactionId: string) => void;
  deleteAllDebtsForCustomer: (customerId: string) => void;
  updateCustomerDebtReminder: (
    customerId: string,
    settings: Partial<DebtReminderSettings>,
  ) => void;
  setCustomerDebtReminderEnabled: (customerId: string, enabled: boolean) => Promise<boolean>;
  testCustomerDebtReminder: (customerId: string) => Promise<boolean>;
  updateCustomerWhatsAppSettings: (
    customerId: string,
    settings: Partial<WhatsAppAutoMessageSettings>,
  ) => void;
  setCustomerWhatsAppAutoMessageEnabled: (customerId: string, enabled: boolean) => Promise<boolean>;
  sendBulkWhatsAppMessages: (
    customerIds: string[],
    messageType?: 'reminder' | 'followup' | 'payment_confirmation' | 'custom',
    dueDate?: string,
    customMessage?: string
  ) => Promise<{ successCount: number; failCount: number }>;
  getCustomerById: (customerId: string) => Customer | undefined;
  addInventoryItem: (input: InventoryInput) => void;
  updateInventoryItem: (itemId: string, input: InventoryInput) => void;
  deleteInventoryItem: (itemId: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedCustomers = await loadCustomers();
        setCustomers(storedCustomers.length ? storedCustomers : seedCustomers);
        setInventory(seedInventory);
      } catch (error) {
        setCustomers(seedCustomers);
        setInventory(seedInventory);
        Alert.alert('تنبيه', 'تعذر تحميل البيانات المحلية، تم فتح البيانات التجريبية.');
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Persist every change so the app stays useful offline between launches.
      saveCustomers(customers).catch(() => {
        Alert.alert('تنبيه', 'تعذر حفظ التغييرات محلياً.');
      });
    }
  }, [customers, loading]);

  useEffect(() => {
    if (loading || Platform.OS === 'web') {
      return;
    }

    syncDebtNotifications(customers).catch(() => {
      Alert.alert('تنبيه', 'تعذر تحديث التذكير التلقائي بالديون.');
    });
  }, [customers, loading]);

  const value = useMemo<AppContextValue>(
    () => ({
      customers,
      inventory,
      loading,
      addCustomer: (input) => {
        setCustomers((current) => [createCustomer(input), ...current]);
      },
      updateCustomer: (customerId, input) => {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  name: input.name.trim(),
                  phone: input.phone.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
      },
      deleteCustomer: (customerId) => {
        setCustomers((current) => current.filter((customer) => customer.id !== customerId));
      },
      addTransaction: (customerId, input) => {
        const transaction: Transaction = createTransaction(input);
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  transactions: [transaction, ...customer.transactions],
                  updatedAt: transaction.date,
                }
              : customer,
          ),
        );
      },
      deleteTransaction: (customerId, transactionId) => {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  transactions: customer.transactions.filter(
                    (transaction) => transaction.id !== transactionId,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
      },
      deleteAllDebtsForCustomer: (customerId) => {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  transactions: customer.transactions.filter(
                    (transaction) => transaction.type !== 'debt',
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
      },
      updateCustomerDebtReminder: (customerId, settings) => {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  debtReminderSettings: {
                    ...defaultDebtReminderSettings,
                    ...customer.debtReminderSettings,
                    ...settings,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
      },
      setCustomerDebtReminderEnabled: async (customerId, enabled) => {
        if (Platform.OS === 'web') {
          Alert.alert('تنبيه', 'الإشعارات المحلية غير مدعومة حالياً على الويب.');
          return false;
        }

        if (enabled) {
          const granted = await requestDebtNotificationPermission();
          if (!granted) {
            Alert.alert('تنبيه', 'يجب السماح بالإشعارات لتفعيل التذكير التلقائي.');
            return false;
          }
        }

        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  debtReminderSettings: {
                    ...defaultDebtReminderSettings,
                    ...customer.debtReminderSettings,
                    enabled,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
        return true;
      },
      testCustomerDebtReminder: async (customerId) => {
        if (Platform.OS === 'web') {
          Alert.alert('تنبيه', 'اختبار الإشعارات غير مدعوم حالياً على الويب.');
          return false;
        }

        const customer = customers.find((item) => item.id === customerId);
        if (!customer) {
          Alert.alert('تنبيه', 'تعذر العثور على الزبون لاختبار التذكير.');
          return false;
        }

        const granted = await requestDebtNotificationPermission();
        if (!granted) {
          Alert.alert('تنبيه', 'يجب السماح بالإشعارات قبل تنفيذ الاختبار.');
          return false;
        }

        await sendDebtReminderTestNotification(customer);
        return true;
      },
      getCustomerById: (customerId) => customers.find((customer) => customer.id === customerId),
      addInventoryItem: (input) => {
        const newItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          ...input,
        };
        setInventory((current) => [newItem, ...current]);
      },
      updateInventoryItem: (itemId, input) => {
        setInventory((current) =>
          current.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  ...input,
                }
              : item,
          ),
        );
      },
      deleteInventoryItem: (itemId) => {
        setInventory((current) => current.filter((item) => item.id !== itemId));
      },
      updateCustomerWhatsAppSettings: (customerId, settings) => {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  whatsAppAutoMessageSettings: {
                    ...customer.whatsAppAutoMessageSettings,
                    ...settings,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
      },
      setCustomerWhatsAppAutoMessageEnabled: async (customerId, enabled) => {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  whatsAppAutoMessageSettings: {
                    ...customer.whatsAppAutoMessageSettings,
                    enabled,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : customer,
          ),
        );
        return true;
      },
      sendBulkWhatsAppMessages: async (customerIds, messageType = 'reminder', dueDate, customMessage) => {
        const customersToMessage = customers.filter(customer => customerIds.includes(customer.id));
        const { sendBulkWhatsAppMessages } = await import('../utils/whatsapp');
        return sendBulkWhatsAppMessages(customersToMessage, messageType, dueDate, customMessage);
      },
    }),
    [customers, inventory, loading],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}
