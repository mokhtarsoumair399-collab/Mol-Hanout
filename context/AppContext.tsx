import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { seedCustomers } from '../storage/demoData';
import { loadCustomers, saveCustomers } from '../storage/appStorage';
import { Customer, CustomerInput, Transaction, TransactionInput } from '../utils/types';
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
