import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius } from './theme';

interface Props {
  texto: string;
  selecionado: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/** Chip de seleção/filtro (loja, forno, peça etc.) — visual único reaproveitado nas telas de lista e formulários. */
export function FilterChip({ texto, selecionado, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selecionado && styles.chipSelecionado, style]}
    >
      <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  texto: { fontSize: 13, color: colors.text },
  textoSelecionado: { color: colors.primaryDark, fontWeight: '600' },
});
