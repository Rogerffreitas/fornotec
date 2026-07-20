import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ServiceType } from '../domain/types';
import { radius, spacing } from './theme';

const SERVICE_TYPE_COLORS: Record<ServiceType, { bg: string; texto: string; borda: string }> = {
  Substituição: { bg: '#DBEAFE', texto: '#1D4ED8', borda: '#93C5FD' },
  Inspeção: { bg: '#FEF3C7', texto: '#B45309', borda: '#FCD34D' },
  Manutenção: { bg: '#DCFCE7', texto: '#15803D', borda: '#86EFAC' },
  Instalação: { bg: '#EDE9FE', texto: '#6D28D9', borda: '#C4B5FD' },
};

interface Props {
  tipo: ServiceType;
  selecionado?: boolean;
  onPress?: () => void;
}

export function ServiceTypeChip({ tipo, selecionado = true, onPress }: Props) {
  const cores = SERVICE_TYPE_COLORS[tipo];
  const estiloChip = [
    styles.chip,
    { borderColor: cores.borda, backgroundColor: selecionado ? cores.bg : '#FFFFFF' },
  ];
  const estiloTexto = [styles.texto, { color: selecionado ? cores.texto : cores.borda }];

  if (!onPress) {
    return (
      <View style={estiloChip}>
        <Text style={estiloTexto}>{tipo}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} style={estiloChip}>
      <Text style={estiloTexto}>{tipo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  texto: { fontSize: 13, fontWeight: '600' },
});
