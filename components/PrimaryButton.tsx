import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        style,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.title,
          variant === 'secondary' && styles.secondaryTitle,
          variant === 'danger' && styles.dangerTitle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A4B14',
    paddingHorizontal: 18,
  },
  secondaryButton: {
    backgroundColor: '#FFF1DB',
    borderWidth: 1,
    borderColor: '#E2C89F',
  },
  dangerButton: {
    backgroundColor: '#FBE2E0',
    borderWidth: 1,
    borderColor: '#D99A95',
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    color: '#FFF8ED',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryTitle: {
    color: '#8A4B14',
  },
  dangerTitle: {
    color: '#9D3129',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
