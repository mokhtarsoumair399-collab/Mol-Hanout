import { Alert, Linking } from 'react-native';
import { getCustomerBalance } from './balance';
import { formatCurrency, formatDate, normalizePhoneNumber } from './formatters';
import { Customer, Transaction } from './types';

function formatTransactionLine(transaction: Transaction) {
  const label = transaction.type === 'debt' ? 'دين' : 'تسديد';
  const note = transaction.note ? ` - ${transaction.note}` : '';

  return `• ${label}: ${formatCurrency(transaction.amount)} | ${formatDate(transaction.date)}${note}`;
}

export function generateWhatsAppMessage(customer: Customer, dueDate?: string) {
  const balance = getCustomerBalance(customer);

  if (balance <= 0) {
    return `السلام عليكم ${customer.name}\nلا يوجد دين حالياً.\nشكراً لتعاملكم معنا 🙏`;
  }

  const transactionsSummary = [...customer.transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(formatTransactionLine)
    .join('\n');

  const dueDateLine = dueDate ? `\n⏰ المرجو تسديد المبلغ قبل: ${formatDate(dueDate)}` : '';

  return `السلام عليكم ${customer.name}
📋 كشف الحساب:

${transactionsSummary}

💰 الرصيد الحالي: ${formatCurrency(balance)}
📅 آخر تحديث: ${formatDate(customer.updatedAt)}
${dueDateLine}

شكراً لتعاملكم معنا 🙏`;
}

export async function sendWhatsAppMessage(customer: Customer, dueDate?: string) {
  const phone = normalizePhoneNumber(customer.phone);

  if (!phone) {
    Alert.alert('تنبيه', 'رقم الهاتف غير متوفر');
    return;
  }

  const message = generateWhatsAppMessage(customer, dueDate);
  // `wa.me` accepts a URL-encoded text query, which keeps Arabic text intact.
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert('تنبيه', 'تعذر فتح واتساب على هذا الجهاز.');
    return;
  }

  await Linking.openURL(url);
}
