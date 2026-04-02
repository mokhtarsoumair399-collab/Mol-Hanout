import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction } from '../utils/types';

export function TransactionItem({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete?: () => void;
}) {
  const isDebt = transaction.type === 'debt';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, isDebt ? styles.debtBadge : styles.paymentBadge]}>
          <Text style={[styles.typeText, isDebt ? styles.debtText : styles.paymentText]}>
            {isDebt ? '💰 دين' : '✅ تسديد'}
          </Text>
        </View>
        <Text style={[styles.amount, { color: isDebt ? '#8A4B14' : '#2C855A' }]}>
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
      <Text style={styles.note}>{transaction.note || 'بدون ملاحظة'}</Text>
      <View style={styles.footer}>
        {onDelete ? (
          <Pressable hitSlop={8} style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteText}>
              {isDebt ? 'حذف الدين' : 'حذف التسديد'}
            </Text>
          </Pressable>
        ) : null}
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8ED',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  debtBadge: {
    backgroundColor: '#FFF1DB',
  },
  paymentBadge: {
    backgroundColor: '#E0F3E8',
  },
  typeText: {
    fontWeight: '800',
    fontSize: 13,
  },
  debtText: {
    color: '#8A4B14',
  },
  paymentText: {
    color: '#2C855A',
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
  note: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 15,
  },
  date: {
    textAlign: 'right',
    color: '#7C6753',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FBE2E0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D99A95',
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#9D3129',
    fontWeight: '800',
    fontSize: 13,
  },
});
