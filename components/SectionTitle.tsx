import React from 'react';
import { StyleSheet, Text } from 'react-native';

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E241B',
    textAlign: 'right',
    marginTop: 8,
  },
});
