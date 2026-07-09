import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from './theme';

export function EmptyState({ texto }: { texto: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xl, alignItems: 'center' },
  texto: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
