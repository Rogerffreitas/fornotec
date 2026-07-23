import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, spacing } from './theme';

export function EmptyState({ texto }: { texto: string }) {
  return (
    <View style={styles.container}>
      <FontAwesome name="inbox" size={28} color={colors.textSecondary} style={styles.icone} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xl, alignItems: 'center' },
  icone: { marginBottom: spacing.sm, opacity: 0.5 },
  texto: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
