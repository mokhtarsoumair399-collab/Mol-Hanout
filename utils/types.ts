export type TransactionType = 'debt' | 'payment';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
};

export type TransactionInput = {
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

export type WhatsAppAutoMessageSettings = {
  enabled: boolean;
  messageType: 'reminder' | 'followup' | 'both';
  followupDelayDays: number; // days after initial reminder to send followup
  autoSendOnPayment: boolean; // send confirmation when payment is made
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
  debtReminderSettings: DebtReminderSettings;
  whatsAppAutoMessageSettings: WhatsAppAutoMessageSettings;
};

export type CustomerInput = {
  name: string;
  phone: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
};

export type InventoryInput = {
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
};
