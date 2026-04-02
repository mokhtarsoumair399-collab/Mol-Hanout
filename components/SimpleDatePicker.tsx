import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type DatePart = 'day' | 'month' | 'year';

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function updateDatePart(date: Date, part: DatePart, delta: number) {
  const nextDate = new Date(date);

  if (part === 'year') {
    const nextYear = nextDate.getFullYear() + delta;
    const maxDay = daysInMonth(nextYear, nextDate.getMonth() + 1);
    nextDate.setFullYear(nextYear);
    if (nextDate.getDate() > maxDay) {
      nextDate.setDate(maxDay);
    }
    return nextDate;
  }

  if (part === 'month') {
    const currentMonth = nextDate.getMonth();
    nextDate.setMonth(currentMonth + delta, 1);
    const maxDay = daysInMonth(nextDate.getFullYear(), nextDate.getMonth() + 1);
    nextDate.setDate(Math.min(date.getDate(), maxDay));
    return nextDate;
  }

  nextDate.setDate(nextDate.getDate() + delta);
  return nextDate;
}

function PickerColumn({
  label,
  value,
  onIncrease,
  onDecrease,
}: {
  label: string;
  value: string;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <Pressable style={styles.adjustButton} onPress={onIncrease}>
        <Text style={styles.adjustText}>+</Text>
      </Pressable>
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <Pressable style={styles.adjustButton} onPress={onDecrease}>
        <Text style={styles.adjustText}>-</Text>
      </Pressable>
    </View>
  );
}

export function SimpleDatePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (nextDate: Date) => void;
}) {
  const display = useMemo(
    () => ({
      day: `${value.getDate()}`.padStart(2, '0'),
      month: `${value.getMonth() + 1}`.padStart(2, '0'),
      year: `${value.getFullYear()}`,
    }),
    [value],
  );

  return (
    <View style={styles.container}>
      <PickerColumn
        label="اليوم"
        value={display.day}
        onIncrease={() => onChange(updateDatePart(value, 'day', 1))}
        onDecrease={() => onChange(updateDatePart(value, 'day', -1))}
      />
      <PickerColumn
        label="الشهر"
        value={display.month}
        onIncrease={() => onChange(updateDatePart(value, 'month', 1))}
        onDecrease={() => onChange(updateDatePart(value, 'month', -1))}
      />
      <PickerColumn
        label="السنة"
        value={display.year}
        onIncrease={() => onChange(updateDatePart(value, 'year', 1))}
        onDecrease={() => onChange(updateDatePart(value, 'year', -1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    backgroundColor: '#FFF8ED',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6D6BC',
    padding: 12,
    alignItems: 'center',
    gap: 10,
  },
  columnLabel: {
    color: '#5C4631',
    fontWeight: '800',
    fontSize: 14,
  },
  adjustButton: {
    width: '100%',
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#F4E1C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustText: {
    color: '#8A4B14',
    fontSize: 24,
    fontWeight: '900',
  },
  valueBox: {
    minHeight: 48,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  valueText: {
    color: '#2E241B',
    fontSize: 18,
    fontWeight: '900',
  },
});
