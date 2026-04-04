import { Alert, Linking } from 'react-native';
import { Customer } from './types';
import { normalizePhoneNumber } from './formatters';
import { sendWhatsAppMessage, WhatsAppMessageType } from './whatsapp';

function getPhoneOrAlert(customer: Customer) {
  const phone = normalizePhoneNumber(customer.phone);

  if (!phone) {
    Alert.alert('تنبيه', 'رقم الهاتف غير متوفر');
    return null;
  }

  return phone;
}

async function openUrl(url: string, fallbackMessage: string) {
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert('تنبيه', fallbackMessage);
    return;
  }

  await Linking.openURL(url);
}

export async function makePhoneCall(customer: Customer) {
  const phone = getPhoneOrAlert(customer);
  if (!phone) {
    return;
  }

  await openUrl(`tel:${phone}`, 'تعذر فتح تطبيق الاتصال على هذا الجهاز.');
}

export async function sendSmsMessage(customer: Customer) {
  const phone = getPhoneOrAlert(customer);
  if (!phone) {
    return;
  }

  await openUrl(`sms:${phone}`, 'تعذر فتح تطبيق الرسائل على هذا الجهاز.');
}

export async function openWhatsAppChat(
  customer: Customer, 
  messageType: WhatsAppMessageType = 'reminder',
  dueDate?: string,
  customMessage?: string
) {
  await sendWhatsAppMessage(customer, messageType, dueDate, customMessage);
}
