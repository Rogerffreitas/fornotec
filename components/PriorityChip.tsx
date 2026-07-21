import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { WorkOrderPriority, WORK_ORDER_PRIORITY_LABELS } from '../domain/types';
import { radius, spacing } from './theme';

const PRIORITY_COLORS: Record<WorkOrderPriority, { bg: string; texto: string; borda: string }> = {
  baixa: { bg: '#DCFCE7', texto: '#15803D', borda: '#86EFAC' },
  media: { bg: '#DBEAFE', texto: '#1D4ED8', borda: '#93C5FD' },
  alta: { bg: '#FFEDD5', texto: '#C2410C', borda: '#FDBA74' },
  urgente: { bg: '#FEE2E2', texto: '#B91C1C', borda: '#FCA5A5' },
};

interface Props {
  prioridade: WorkOrderPriority;
  selecionado?: boolean;
  onPress?: () => void;
}

/**
 * Sem onPress, renderiza como badge compacto (mesmo formato do status
 * badge do ListRow) para os dois ficarem alinhados lado a lado. Com
 * onPress, vira o chip maior usado no seletor de prioridade (nova ordem).
 */
export function PriorityChip({ prioridade, selecionado = true, onPress }: Props) {
  const cores = PRIORITY_COLORS[prioridade];
  const rotulo = WORK_ORDER_PRIORITY_LABELS[prioridade];

  if (!onPress) {
    return (
      <View style={[styles.badge, { backgroundColor: cores.bg }]}>
        <Text style={[styles.badgeTexto, { color: cores.texto }]}>{rotulo}</Text>
      </View>
    );
  }

  const estiloChip = [
    styles.chip,
    { borderColor: cores.borda, backgroundColor: selecionado ? cores.bg : '#FFFFFF' },
  ];
  const estiloTexto = [styles.texto, { color: selecionado ? cores.texto : cores.borda }];

  return (
    <Pressable onPress={onPress} style={estiloChip}>
      <Text style={estiloTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.lg },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  texto: { fontSize: 13, fontWeight: '600' },
});
