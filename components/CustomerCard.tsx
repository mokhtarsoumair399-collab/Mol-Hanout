import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCustomerBalance } from '../utils/balance';
import { formatCurrency } from '../utils/formatters';
import { Customer } from '../utils/types';

export function CustomerCard({
  customer,
  onPress,
}: {
  customer: Customer;
  onPress: () => void;
}) {
  const balance = getCustomerBalance(customer);
  const isDebtor = balance > 0;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, isDebtor ? styles.debtBadge : styles.paidBadge]}>
          <Text style={[styles.badgeText, isDebtor ? styles.debtText : styles.paidText]}>
            {isDebtor ? 'مدين' : 'مسدد'}
          </Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.phone}>{customer.phone || 'بدون رقم هاتف'}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.balance, { color: isDebtor ? '#8A4B14' : '#2C855A' }]}>
          {formatCurrency(Math.max(balance, 0))}
        </Text>
        <Text style={styles.caption}>الرصيد الحالي</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8ED',
    borderRadius: 22,
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  pressed: {
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2E241B',
    textAlign: 'right',
  },
  phone: {
    fontSize: 14,
    color: '#7C6753',
    textAlign: 'right',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  debtBadge: {
    backgroundColor: '#FFF1DB',
  },
  paidBadge: {
    backgroundColor: '#E0F3E8',
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 13,
  },
  debtText: {
    color: '#8A4B14',
  },
  paidText: {
    color: '#2C855A',
  },
  footer: {
    gap: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
  },
  caption: {
    color: '#7C6753',
    textAlign: 'right',
  },
});
