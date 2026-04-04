import { Customer, CustomerInput, DebtReminderSettings, Transaction, TransactionInput } from './types';

export const defaultDebtReminderSettings: DebtReminderSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function createCustomer(input: CustomerInput): Customer {
  const now = new Date().toISOString();

  return {
    id: createId('customer'),
    name: input.name.trim(),
    phone: input.phone.trim(),
    createdAt: now,
    updatedAt: now,
    transactions: [],
    debtReminderSettings: defaultDebtReminderSettings,
  };
}

export function createTransaction(input: TransactionInput): Transaction {
  return {
    id: createId('trx'),
    type: input.type,
    amount: input.amount,
    note: input.note.trim(),
    date: input.date,
  };
}
