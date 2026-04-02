import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type ArabicInputProps = TextInputProps & {
  label: string;
};

export function ArabicInput({ label, style, ...props }: ArabicInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#93836F"
        style={[styles.input, style]}
        textAlign="right"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    textAlign: 'right',
    color: '#5C4631',
    fontWeight: '700',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#FFF8ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6D6BC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2E241B',
  },
});
