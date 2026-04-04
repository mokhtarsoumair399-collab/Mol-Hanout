import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { useAppContext } from '../context/AppContext';
import { getCustomerBalance, getTopDebtor, getTotalDebts } from '../utils/balance';
import { formatCurrency } from '../utils/formatters';

export function DashboardScreen() {
  const { customers } = useAppContext();
  const topDebtor = getTopDebtor(customers);
  const topDebtorBalance = topDebtor ? getCustomerBalance(topDebtor) : 0;
  const customersWithReminder = customers.filter((customer) => customer.debtReminderSettings.enabled);

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Mol Hanout</Text>
        <Text style={styles.heroTitle}>متابعة الديون اليومية بطريقة سهلة وسريعة</Text>
        <Text style={styles.heroSubtitle}>
          اعرف الرصيد الحالي، راقب أكثر الزبائن ديناً، وابقَ جاهزاً لإرسال التذكير عبر واتساب.
        </Text>
      </View>

      <SectionTitle>لوحة الملخص</SectionTitle>
      <View style={styles.grid}>
        <StatCard icon="💰" title="إجمالي الديون" value={formatCurrency(getTotalDebts(customers))} />
        <StatCard icon="👤" title="عدد الزبائن" value={`${customers.length} زبون`} accent="#2C855A" />
      </View>
      <StatCard
        icon="📈"
        title="أعلى الزبائن ديناً"
        value={topDebtor ? `${topDebtor.name} - ${formatCurrency(Math.max(topDebtorBalance, 0))}` : 'لا يوجد'}
        accent="#9A2E1D"
      />

      <SectionTitle>🔔 Notifications تلقائية للديون</SectionTitle>
      <View style={styles.reminderCard}>
        <Text style={styles.reminderTitle}>تذكير مخصص لكل زبون</Text>
        <Text style={styles.reminderSubtitle}>
          يمكنك الآن تفعيل وقت تذكير مختلف لكل زبون من شاشة تفاصيل الحساب.
        </Text>
        <View style={styles.reminderStatsRow}>
          <Text style={styles.reminderStatValue}>{customersWithReminder.length}</Text>
          <Text style={styles.reminderStatLabel}>زبائن لديهم تذكير مفعل</Text>
        </View>
        <View style={styles.reminderStatsRow}>
          <Text style={styles.reminderStatValue}>
            {customersWithReminder.filter((customer) => getCustomerBalance(customer) > 0).length}
          </Text>
          <Text style={styles.reminderStatLabel}>سيصلهم تذكير فعلياً بسبب وجود دين</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#2E241B',
    borderRadius: 28,
    padding: 22,
    gap: 8,
  },
  heroEyebrow: {
    color: '#F4E1C1',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFF8ED',
    textAlign: 'right',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: '#E8D7C0',
    textAlign: 'right',
    fontSize: 15,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  reminderCard: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E7D7BD',
    padding: 18,
    gap: 14,
  },
  reminderTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 20,
    fontWeight: '900',
  },
  reminderSubtitle: {
    textAlign: 'right',
    color: '#6A5440',
    fontSize: 15,
    lineHeight: 24,
  },
  reminderStatsRow: {
    backgroundColor: '#F7F1E7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderStatLabel: {
    color: '#6A5440',
    fontWeight: '700',
  },
  reminderStatValue: {
    color: '#8A4B14',
    fontWeight: '900',
    fontSize: 20,
  },
});
