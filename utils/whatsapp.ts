import { Alert, Linking, Platform } from 'react-native';
import { getCustomerBalance } from './balance';
import { formatCurrency, formatDate, normalizePhoneNumber } from './formatters';
import { Customer, Transaction } from './types';

export type WhatsAppMessageType = 'reminder' | 'followup' | 'payment_confirmation' | 'custom';

function formatTransactionLine(transaction: Transaction) {
  const label = transaction.type === 'debt' ? 'دين' : 'تسديد';
  const note = transaction.note ? ` - ${transaction.note}` : '';

  return `• ${label}: ${formatCurrency(transaction.amount)} | ${formatDate(transaction.date)}${note}`;
}

export function generateWhatsAppMessage(
  customer: Customer, 
  messageType: WhatsAppMessageType = 'reminder',
  dueDate?: string,
  customMessage?: string
) {
  const balance = getCustomerBalance(customer);

  if (messageType === 'custom' && customMessage) {
    return `السلام عليكم ${customer.name}\n\n${customMessage}\n\nشكراً لتعاملكم معنا 🙏`;
  }

  if (balance <= 0) {
    if (messageType === 'payment_confirmation') {
      return `السلام عليكم ${customer.name}\n\n✅ تم تسجيل تسديدكم بالكامل!\nلا يوجد دين حالياً.\n\nشكراً لتعاملكم معنا 🙏`;
    }
    return `السلام عليكم ${customer.name}\nلا يوجد دين حالياً.\nشكراً لتعاملكم معنا 🙏`;
  }

  const transactionsSummary = [...customer.transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(formatTransactionLine)
    .join('\n');

  const dueDateLine = dueDate ? `\n⏰ المرجو تسديد المبلغ قبل: ${formatDate(dueDate)}` : '';

  switch (messageType) {
    case 'followup':
      return `السلام عليكم ${customer.name}
🔔 تذكير بالدين المعلق

💰 الرصيد الحالي: ${formatCurrency(balance)}
📅 آخر تحديث: ${formatDate(customer.updatedAt)}
${dueDateLine}

نرجو منكم تسديد المبلغ في أقرب وقت ممكن.
شكراً لتعاملكم معنا 🙏`;

    case 'payment_confirmation':
      return `السلام عليكم ${customer.name}
✅ تم تسجيل تسديدكم!

💰 الرصيد الحالي: ${formatCurrency(balance)}
📅 آخر تحديث: ${formatDate(customer.updatedAt)}

شكراً لتعاملكم معنا 🙏`;

    case 'reminder':
    default:
      return `السلام عليكم ${customer.name}
📋 كشف الحساب:

${transactionsSummary}

💰 الرصيد الحالي: ${formatCurrency(balance)}
📅 آخر تحديث: ${formatDate(customer.updatedAt)}
${dueDateLine}

شكراً لتعاملكم معنا 🙏`;
  }
}

export async function sendWhatsAppMessage(
  customer: Customer, 
  messageType: WhatsAppMessageType = 'reminder',
  dueDate?: string,
  customMessage?: string
) {
  const phone = normalizePhoneNumber(customer.phone);

  if (!phone) {
    Alert.alert('تنبيه', 'رقم الهاتف غير متوفر');
    return false;
  }

  const message = generateWhatsAppMessage(customer, messageType, dueDate, customMessage);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert('تنبيه', 'تعذر فتح واتساب على هذا الجهاز.');
    return false;
  }

  await Linking.openURL(url);
  return true;
}

export async function sendBulkWhatsAppMessages(
  customers: Customer[],
  messageType: WhatsAppMessageType = 'reminder',
  dueDate?: string,
  customMessage?: string,
  delayBetweenMessages: number = 2000
) {
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    
    try {
      const success = await sendWhatsAppMessage(customer, messageType, dueDate, customMessage);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`Failed to send WhatsApp message to ${customer.name}:`, error);
      failCount++;
    }

    // Add delay between messages to avoid overwhelming the system
    if (i < customers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
    }
  }

  return { successCount, failCount };
}

// Auto messaging functions for integration with notification system
export async function sendAutoWhatsAppReminder(customer: Customer) {
  const balance = getCustomerBalance(customer);
  if (balance <= 0) {
    return false; // No debt, no reminder needed
  }

  // Send initial reminder
  return await sendWhatsAppMessage(customer, 'reminder');
}

export async function sendAutoWhatsAppFollowup(customer: Customer, daysOverdue: number = 7) {
  const balance = getCustomerBalance(customer);
  if (balance <= 0) {
    return false;
  }

  // Calculate follow-up due date (current date + daysOverdue)
  const followupDate = new Date();
  followupDate.setDate(followupDate.getDate() + daysOverdue);
  
  return await sendWhatsAppMessage(customer, 'followup', followupDate.toISOString().split('T')[0]);
}

export async function sendAutoWhatsAppPaymentConfirmation(customer: Customer) {
  return await sendWhatsAppMessage(customer, 'payment_confirmation');
}
