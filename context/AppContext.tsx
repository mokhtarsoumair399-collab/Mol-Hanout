import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { seedCustomers } from '../storage/demoData';
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
} from '../utils/types';
import { createCustomer, createTransaction } from '../utils/factories';

type AppContextValue = {
  customers: Customer[];
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
  getCustomerById: (customerId: string) => Customer | undefined;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedCustomers = await loadCustomers();
        setCustomers(storedCustomers.length ? storedCustomers : seedCustomers);
      } catch (error) {
        setCustomers(seedCustomers);
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
    }),
    [customers, loading],
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
