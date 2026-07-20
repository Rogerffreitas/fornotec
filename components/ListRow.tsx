import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from './theme';

export type Tom = 'sucesso' | 'aviso' | 'perigo' | 'neutro';

interface Props {
  titulo: string;
  subtitulo?: string;
  detalhes?: string;
  badge?: { texto: string; tom: Tom };
  badgeNode?: React.ReactNode;
  onPress?: () => void;
}

const TONS: Record<Tom, { bg: string; texto: string }> = {
  sucesso: { bg: '#DCFCE7', texto: '#15803D' },
  aviso: { bg: '#FEF3C7', texto: '#B45309' },
  perigo: { bg: '#FEE2E2', texto: '#B91C1C' },
  neutro: { bg: '#E5E7EB', texto: '#374151' },
};

export function Badge({ texto, tom }: { texto: string; tom: Tom }) {
  return (
    <View style={[styles.badge, { backgroundColor: TONS[tom].bg }]}>
      <Text style={[styles.badgeTexto, { color: TONS[tom].texto }]}>{texto}</Text>
    </View>
  );
}

export function ListRow({ titulo, subtitulo, detalhes, badge, badgeNode, onPress }: Props) {
  const conteudo = (
    <>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>{titulo}</Text>
        {badgeNode ?? (badge ? <Badge texto={badge.texto} tom={badge.tom} /> : null)}
      </View>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      {detalhes ? <Text style={styles.detalhes}>{detalhes}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.linha, pressed && styles.pressionado]}
      >
        {conteudo}
      </Pressable>
    );
  }

  return <View style={styles.linha}>{conteudo}</View>;
}

const styles = StyleSheet.create({
  linha: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressionado: { opacity: 0.7 },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titulo: { fontSize: 15, fontWeight: '600', color: colors.text, flexShrink: 1 },
  subtitulo: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detalhes: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.lg },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
});
