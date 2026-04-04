import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArabicInput } from '../components/ArabicInput';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SimpleDatePicker } from '../components/SimpleDatePicker';
import { SimpleTimePicker } from '../components/SimpleTimePicker';
import { TransactionItem } from '../components/TransactionItem';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { makePhoneCall, openWhatsAppChat, sendSmsMessage } from '../utils/communication';
import { getCustomerBalance } from '../utils/balance';
import { formatCurrency, formatDate, formatDateToIso } from '../utils/formatters';
import { showToast } from '../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerDetail'>;

export function CustomerDetailScreen({ navigation, route }: Props) {
  const {
    getCustomerById,
    addTransaction,
    deleteCustomer,
    deleteTransaction,
    deleteAllDebtsForCustomer,
    updateCustomerDebtReminder,
    setCustomerDebtReminderEnabled,
    testCustomerDebtReminder,
  } = useAppContext();
  const customer = getCustomerById(route.params.customerId);
  const [modalVisible, setModalVisible] = useState(false);
  const [whatsAppModalVisible, setWhatsAppModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState<Date>(new Date());
  const [includeDueDate, setIncludeDueDate] = useState(true);
  const [type, setType] = useState<'debt' | 'payment'>('debt');
  const [reminderExpanded, setReminderExpanded] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date>(() => {
    const initialDate = new Date();
    initialDate.setHours(customer?.debtReminderSettings.hour ?? 9);
    initialDate.setMinutes(customer?.debtReminderSettings.minute ?? 0);
    initialDate.setSeconds(0);
    initialDate.setMilliseconds(0);
    return initialDate;
  });

  const balance = useMemo(() => (customer ? getCustomerBalance(customer) : 0), [customer]);
  const reminderTimeLabel = useMemo(
    () =>
      `${String(reminderTime.getHours()).padStart(2, '0')}:${String(
        reminderTime.getMinutes(),
      ).padStart(2, '0')}`,
    [reminderTime],
  );

  useEffect(() => {
    if (!customer) {
      return;
    }

    const nextReminderTime = new Date();
    nextReminderTime.setHours(customer.debtReminderSettings.hour);
    nextReminderTime.setMinutes(customer.debtReminderSettings.minute);
    nextReminderTime.setSeconds(0);
    nextReminderTime.setMilliseconds(0);
    setReminderTime(nextReminderTime);
  }, [customer]);

  if (!customer) {
    return (
      <ScreenContainer>
        <EmptyState title="الزبون غير موجود" subtitle="قد يكون قد تم حذفه من الجهاز." />
      </ScreenContainer>
    );
  }

  const resetModal = () => {
    setModalVisible(false);
    setAmount('');
    setNote('');
    setType('debt');
  };

  const resetWhatsAppModal = () => {
    setWhatsAppModalVisible(false);
    setPaymentDueDate(new Date());
    setIncludeDueDate(true);
  };

  const handleAddTransaction = () => {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('تنبيه', 'أدخل مبلغاً صحيحاً');
      return;
    }

    addTransaction(customer.id, {
      type,
      amount: parsedAmount,
      note,
      date: new Date().toISOString(),
    });
    resetModal();
  };

  const handleDelete = () => {
    Alert.alert('حذف الزبون', 'هل أنت متأكد من حذف هذا الزبون وكل معاملاته؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          deleteCustomer(customer.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDeleteTransaction = (transactionId: string, transactionType: 'debt' | 'payment') => {
    const title = transactionType === 'debt' ? 'حذف الدين' : 'حذف التسديد';
    const message =
      transactionType === 'debt'
        ? 'هل تريد حذف هذا الدين من الحساب؟'
        : 'هل تريد حذف عملية التسديد هذه من الحساب؟';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        deleteTransaction(customer.id, transactionId);
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => deleteTransaction(customer.id, transactionId),
      },
    ]);
  };

  const handleDeleteAllDebts = () => {
    const hasAnyDebt = customer.transactions.some((transaction) => transaction.type === 'debt');

    if (!hasAnyDebt) {
      Alert.alert('تنبيه', 'لا توجد ديون لحذفها لهذا الزبون.');
      return;
    }

    const title = 'حذف جميع الديون';
    const message = 'هل تريد حذف كل الديون الخاصة بهذا الزبون دفعة واحدة؟';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        deleteAllDebtsForCustomer(customer.id);
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف الكل',
        style: 'destructive',
        onPress: () => deleteAllDebtsForCustomer(customer.id),
      },
    ]);
  };

  const handleSendWhatsApp = async () => {
    if (includeDueDate) {
      await openWhatsAppChat(customer, formatDateToIso(paymentDueDate));
    } else {
      await openWhatsAppChat(customer);
    }

    resetWhatsAppModal();
  };

  const handleSaveReminderTime = () => {
    updateCustomerDebtReminder(customer.id, {
      hour: reminderTime.getHours(),
      minute: reminderTime.getMinutes(),
    });
    showToast('تم حفظ وقت التذكير لهذا الزبون.');
  };

  const handleToggleReminder = async () => {
    if (balance <= 0 && !customer.debtReminderSettings.enabled) {
      Alert.alert('تنبيه', 'لا يوجد دين حالي لهذا الزبون. يمكنك التفعيل لاحقاً بعد إضافة دين.');
      return;
    }

    const nextEnabled = !customer.debtReminderSettings.enabled;
    const enabled = await setCustomerDebtReminderEnabled(customer.id, nextEnabled);
    if (!enabled && nextEnabled) {
      return;
    }

    showToast(
      nextEnabled ? 'تم تفعيل التذكير التلقائي لهذا الزبون.' : 'تم إيقاف التذكير لهذا الزبون.',
    );
  };

  const handleTestReminder = async () => {
    if (balance <= 0) {
      Alert.alert('تنبيه', 'أضف ديناً لهذا الزبون أولاً حتى يظهر اختبار التذكير بشكل مفيد.');
      return;
    }

    const success = await testCustomerDebtReminder(customer.id);
    if (!success) {
      return;
    }

    showToast('أُرسل إشعار تجريبي الآن لهذا الزبون.');
  };

  return (
    <>
      <ScreenContainer>
        <View style={styles.headerCard}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.phone}>{customer.phone || 'بدون رقم هاتف'}</Text>
          <Text style={[styles.balance, { color: balance > 0 ? '#8A4B14' : '#2C855A' }]}>
            {formatCurrency(Math.max(balance, 0))}
          </Text>
          <Text style={styles.status}>{balance > 0 ? 'الزبون مدين' : 'الزبون مسدد'}</Text>
        </View>

        <View style={styles.actionGrid}>
          <PrimaryButton style={styles.flexButton} title="💰 إضافة دين" onPress={() => { setType('debt'); setModalVisible(true); }} />
          <PrimaryButton style={styles.flexButton} title="✅ إضافة تسديد" variant="secondary" onPress={() => { setType('payment'); setModalVisible(true); }} />
        </View>
        <View style={styles.actionGrid}>
          <PrimaryButton style={styles.flexButton} title="📞 اتصال هاتفي" variant="secondary" onPress={() => makePhoneCall(customer)} />
          <PrimaryButton style={styles.flexButton} title="✉️ SMS" variant="secondary" onPress={() => sendSmsMessage(customer)} />
        </View>
        <PrimaryButton title="📲 إرسال عبر واتساب" onPress={() => setWhatsAppModalVisible(true)} />
        <Text style={styles.helperText}>
          يمكن للتطبيق فتح الاتصال الهاتفي وSMS وواتساب. أما سجل المكالمات أو بدء مكالمة صوتية واتساب مباشرة فغير مدعوم هنا.
        </Text>
        <View style={styles.reminderCard}>
          <Pressable
            onPress={() => setReminderExpanded((current) => !current)}
            style={({ pressed }) => [styles.reminderHeader, pressed && styles.reminderHeaderPressed]}
          >
            <View style={styles.reminderHeaderTextWrap}>
              <Text style={styles.reminderTitle}>🔔 تذكير تلقائي لهذا الزبون</Text>
              <Text style={styles.helperText}>
                {customer.debtReminderSettings.enabled
                  ? `مفعل يومياً على الساعة ${String(customer.debtReminderSettings.hour).padStart(
                      2,
                      '0',
                    )}:${String(customer.debtReminderSettings.minute).padStart(2, '0')}.`
                  : 'فعّل التذكير ليصلك إشعار يومي خاص بهذا الزبون عندما يكون لديه دين غير مسدد.'}
              </Text>
            </View>
            <Text style={styles.reminderChevron}>{reminderExpanded ? '▲' : '▼'}</Text>
          </Pressable>
          {reminderExpanded ? (
            <>
              <Text style={styles.selectedTimeText}>الوقت المختار: {reminderTimeLabel}</Text>
              <SimpleTimePicker value={reminderTime} onChange={setReminderTime} />
              <View style={styles.actionGrid}>
                <PrimaryButton
                  style={styles.flexButton}
                  title="🧪 اختبار الآن"
                  variant="secondary"
                  onPress={handleTestReminder}
                />
              </View>
              <View style={styles.actionGrid}>
                <PrimaryButton
                  style={styles.flexButton}
                  title="💾 حفظ الوقت"
                  variant="secondary"
                  onPress={handleSaveReminderTime}
                />
                <PrimaryButton
                  style={styles.flexButton}
                  title={customer.debtReminderSettings.enabled ? '⏸️ إيقاف التذكير' : '▶️ تفعيل التذكير'}
                  onPress={handleToggleReminder}
                />
              </View>
            </>
          ) : null}
        </View>
        <PrimaryButton title="🧹 حذف جميع الديون" variant="danger" onPress={handleDeleteAllDebts} />
        <View style={styles.actionGrid}>
          <PrimaryButton style={styles.flexButton} title="تعديل الزبون" variant="secondary" onPress={() => navigation.navigate('CustomerForm', { customerId: customer.id })} />
          <PrimaryButton style={styles.flexButton} title="حذف الزبون" variant="danger" onPress={handleDelete} />
        </View>

        <Text style={styles.sectionTitle}>سجل المعاملات</Text>
        {customer.transactions.length ? (
          customer.transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onDelete={() => handleDeleteTransaction(transaction.id, transaction.type)}
            />
          ))
        ) : (
          <EmptyState title="لا توجد معاملات" subtitle="أضف أول دين أو تسديد لهذا الزبون." />
        )}
      </ScreenContainer>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={resetModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{type === 'debt' ? 'إضافة دين جديد' : 'إضافة تسديد جديد'}</Text>
            <ArabicInput
              label="المبلغ"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="numeric"
            />
            <ArabicInput
              label="ملاحظة"
              value={note}
              onChangeText={setNote}
              placeholder="مثال: مواد غذائية"
            />
            <View style={styles.actionGrid}>
              <PrimaryButton style={styles.flexButton} title="إلغاء" variant="secondary" onPress={resetModal} />
              <PrimaryButton style={styles.flexButton} title="حفظ العملية" onPress={handleAddTransaction} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={whatsAppModalVisible}
        onRequestClose={resetWhatsAppModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>تحديد موعد الأداء</Text>
            <PrimaryButton
              title={includeDueDate ? '✅ تم تفعيل تاريخ الأداء' : '➕ إضافة تاريخ للأداء'}
              variant="secondary"
              onPress={() => setIncludeDueDate((current) => !current)}
            />
            {includeDueDate ? (
              <>
                <Text style={styles.inputLabel}>اختيار تاريخ الأداء</Text>
                <SimpleDatePicker value={paymentDueDate} onChange={setPaymentDueDate} />
                <Text style={styles.selectedDateText}>
                  التاريخ المختار: {formatDate(formatDateToIso(paymentDueDate))}
                </Text>
              </>
            ) : null}
            <Text style={styles.helperText}>
              يمكنك تشغيل أو إخفاء تاريخ الأداء قبل إرسال الرسالة.
            </Text>
            <View style={styles.actionGrid}>
              <PrimaryButton style={styles.flexButton} title="إلغاء" variant="secondary" onPress={resetWhatsAppModal} />
              <PrimaryButton style={styles.flexButton} title="إرسال الآن" onPress={handleSendWhatsApp} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#FFF8ED',
    borderRadius: 28,
    padding: 22,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2E241B',
    textAlign: 'right',
  },
  phone: {
    fontSize: 15,
    color: '#7C6753',
    textAlign: 'right',
  },
  balance: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
  },
  status: {
    textAlign: 'right',
    color: '#6A5440',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E241B',
    textAlign: 'right',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  reminderCard: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6D6BC',
    padding: 16,
    gap: 14,
  },
  reminderTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 20,
    fontWeight: '900',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reminderHeaderPressed: {
    opacity: 0.85,
  },
  reminderHeaderTextWrap: {
    flex: 1,
    gap: 6,
  },
  reminderChevron: {
    color: '#8A4B14',
    fontSize: 18,
    fontWeight: '900',
  },
  selectedTimeText: {
    textAlign: 'right',
    color: '#8A4B14',
    fontWeight: '800',
  },
  flexButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(46, 36, 27, 0.35)',
  },
  modalCard: {
    backgroundColor: '#F7F1E7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 22,
    fontWeight: '900',
  },
  inputLabel: {
    textAlign: 'right',
    color: '#5C4631',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
  },
  helperText: {
    textAlign: 'right',
    color: '#6A5440',
    lineHeight: 22,
  },
  selectedDateText: {
    textAlign: 'right',
    color: '#8A4B14',
    fontWeight: '800',
  },
});
