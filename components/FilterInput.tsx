import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, spacing, radius } from './theme';

interface Props {
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder?: string;
}

export function FilterInput({ valor, aoMudar, placeholder = 'Filtrar...' }: Props) {
  return (
    <View style={styles.container}>
      <FontAwesome name="search" size={14} color={colors.textSecondary} style={styles.icone} />
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, justifyContent: 'center' },
  icone: { position: 'absolute', left: spacing.md, zIndex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.xl + spacing.xs,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.card,
    fontSize: 14,
  },
});
