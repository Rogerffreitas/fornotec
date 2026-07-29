import React from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { findLocation } from '../../../domain/types';
import { spacing } from '../../../components/theme';
import { useParts } from './useParts';

export default function Pecas() {
  const { pecas, filtro, carregando, handleFiltro, recarregar } = useParts();

  return (
    <Screen>
      <FilterInput
        valor={filtro}
        aoMudar={handleFiltro}
        placeholder="Filtrar por descrição ou referência..."
      />
      <FlatList
        data={pecas}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={recarregar}
        ListEmptyComponent={<EmptyState texto="Nenhuma peça encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`${item.reference} · ${item.description}`}
            subtitulo={findLocation(item.location).description}
            onPress={() => router.push(`/pecas/${item.id}`)}
          />
        )}
      />
      <PrimaryButton
        titulo="+ Nova peça"
        onPress={() => router.push('/pecas/nova-peca')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
