import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, radius } from './theme';

interface Props extends TextInputProps {
  rotulo: string;
  erro?: string;
}

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { rotulo, erro, style, ...rest },
  ref,
) {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, erro ? styles.inputComErro : null, style]}
        {...rest}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputComErro: { borderColor: colors.danger },
  erro: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
});
