import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function StatCard({
  icon,
  title,
  value,
  accent = '#8A4B14',
}: {
  icon: string;
  title: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFF8ED',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 10,
    minHeight: 140,
  },
  icon: {
    fontSize: 22,
    textAlign: 'right',
  },
  title: {
    color: '#6A5440',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
  },
});
