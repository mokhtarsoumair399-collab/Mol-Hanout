import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  icon: {
    fontSize: 28,
  },
  title: {
    color: '#2E241B',
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7C6753',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
