import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from './theme';
import { SignaturePadHandle } from './SignaturePad.types';

export type { SignaturePadHandle };

interface Props {
  altura?: number;
}

/**
 * Fallback para nativo (iOS/Android): captura de assinatura só está implementada na versão
 * web hoje (ver SignaturePad.web.tsx), no mesmo espírito do "Baixar PDF" já ser web-only.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ altura = 160 }, ref) => {
  useImperativeHandle(ref, () => ({
    limpar: () => {},
    estaVazia: () => true,
    obterAssinatura: () => ({ tracos: [], largura: 0, altura: 0 }),
  }));

  return (
    <View style={[styles.container, { height: altura }]}>
      <Text style={styles.texto}>Assinatura disponível apenas na versão web por enquanto.</Text>
    </View>
  );
});

SignaturePad.displayName = 'SignaturePad';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  texto: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
});
