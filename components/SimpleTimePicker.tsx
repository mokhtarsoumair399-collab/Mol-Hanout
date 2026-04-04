import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type TimePart = 'hour' | 'minute';

function updateTimePart(date: Date, part: TimePart, delta: number) {
  const nextDate = new Date(date);

  if (part === 'hour') {
    const nextHour = (nextDate.getHours() + delta + 24) % 24;
    nextDate.setHours(nextHour);
    return nextDate;
  }

  const nextMinute = (nextDate.getMinutes() + delta + 60) % 60;
  nextDate.setMinutes(nextMinute);
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

export function SimpleTimePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (nextDate: Date) => void;
}) {
  const display = useMemo(
    () => ({
      hour: `${value.getHours()}`.padStart(2, '0'),
      minute: `${value.getMinutes()}`.padStart(2, '0'),
    }),
    [value],
  );

  return (
    <View style={styles.container}>
      <PickerColumn
        label="الدقيقة"
        value={display.minute}
        onIncrease={() => onChange(updateTimePart(value, 'minute', 1))}
        onDecrease={() => onChange(updateTimePart(value, 'minute', -1))}
      />
      <PickerColumn
        label="الساعة"
        value={display.hour}
        onIncrease={() => onChange(updateTimePart(value, 'hour', 1))}
        onDecrease={() => onChange(updateTimePart(value, 'hour', -1))}
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
