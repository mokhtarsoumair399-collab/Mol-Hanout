export type TransactionType = 'debt' | 'payment';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
};

export type DebtReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
  debtReminderSettings: DebtReminderSettings;
};

export type CustomerInput = {
  name: string;
  phone: string;
};

export type TransactionInput = {
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
};
