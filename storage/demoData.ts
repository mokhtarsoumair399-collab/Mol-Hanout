import { Customer, InventoryItem } from '../utils/types';
import { defaultDebtReminderSettings, defaultWhatsAppAutoMessageSettings } from '../utils/factories';

export const seedCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'أحمد العلوي',
    phone: '212612345678',
    createdAt: '2026-03-27T10:00:00.000Z',
    updatedAt: '2026-04-01T15:00:00.000Z',
    transactions: [
      {
        id: 'trx-1',
        type: 'debt',
        amount: 240,
        note: 'مواد غذائية',
        date: '2026-04-01T15:00:00.000Z',
      },
      {
        id: 'trx-2',
        type: 'payment',
        amount: 90,
        note: 'تسديد جزئي',
        date: '2026-03-30T12:00:00.000Z',
      },
    ],
    debtReminderSettings: defaultDebtReminderSettings,
    whatsAppAutoMessageSettings: defaultWhatsAppAutoMessageSettings,
  },
  {
    id: 'customer-2',
    name: 'فاطمة الزهراء',
    phone: '212698765432',
    createdAt: '2026-03-22T09:30:00.000Z',
    updatedAt: '2026-04-02T11:30:00.000Z',
    transactions: [
      {
        id: 'trx-3',
        type: 'debt',
        amount: 120,
        note: 'منظفات',
        date: '2026-04-02T11:30:00.000Z',
      },
    ],
    debtReminderSettings: {
      enabled: true,
      hour: 10,
      minute: 30,
    },
    whatsAppAutoMessageSettings: {
      enabled: true,
      messageType: 'both',
      followupDelayDays: 5,
      autoSendOnPayment: true,
    },
  },
  {
    id: 'customer-3',
    name: 'محمد أمين',
    phone: '',
    createdAt: '2026-03-25T08:00:00.000Z',
    updatedAt: '2026-03-29T18:00:00.000Z',
    transactions: [
      {
        id: 'trx-4',
        type: 'debt',
        amount: 75,
        note: 'سكر وشاي',
        date: '2026-03-29T18:00:00.000Z',
      },
      {
        id: 'trx-5',
        type: 'payment',
        amount: 75,
        note: 'تم التسديد',
        date: '2026-03-31T13:00:00.000Z',
      },
    ],
    debtReminderSettings: defaultDebtReminderSettings,
    whatsAppAutoMessageSettings: defaultWhatsAppAutoMessageSettings,
  },
  {
    id: 'customer-4',
    name: 'سعاد الإدريسي',
    phone: '212655112233',
    createdAt: '2026-03-18T10:15:00.000Z',
    updatedAt: '2026-03-28T17:45:00.000Z',
    transactions: [
      {
        id: 'trx-6',
        type: 'debt',
        amount: 310,
        note: 'فاتورة أسبوعية',
        date: '2026-03-28T17:45:00.000Z',
      },
    ],
    debtReminderSettings: {
      enabled: true,
      hour: 18,
      minute: 0,
    },
    whatsAppAutoMessageSettings: {
      enabled: false,
      messageType: 'reminder',
      followupDelayDays: 7,
      autoSendOnPayment: false,
    },
  },
];

export const seedInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'زيت الزيتون',
    currentStock: 15,
    minStock: 5,
    unit: 'لتر',
    category: 'زيوت وتوابل',
  },
  {
    id: 'inv-2',
    name: 'سكر',
    currentStock: 3,
    minStock: 10,
    unit: 'كيلو',
    category: 'مواد أساسية',
  },
  {
    id: 'inv-3',
    name: 'أرز',
    currentStock: 25,
    minStock: 8,
    unit: 'كيلو',
    category: 'مواد أساسية',
  },
  {
    id: 'inv-4',
    name: 'شاي أخضر',
    currentStock: 2,
    minStock: 5,
    unit: 'كيلو',
    category: 'مشروبات',
  },
  {
    id: 'inv-5',
    name: 'قهوة',
    currentStock: 12,
    minStock: 3,
    unit: 'كيلو',
    category: 'مشروبات',
  },
  {
    id: 'inv-6',
    name: 'حليب مجفف',
    currentStock: 8,
    minStock: 4,
    unit: 'علبة',
    category: 'ألبان',
  },
];
