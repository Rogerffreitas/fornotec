import React from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { useOvensForParts } from './useOvensForParts';

export default function PecasForno() {
  const { fornosFiltrados, lojasPorId, filtro, setFiltro, carregando, recarregar } =
    useOvensForParts();

  return (
    <Screen>
      <FilterInput
        valor={filtro}
        aoMudar={setFiltro}
        placeholder="Filtrar por descrição do forno..."
      />
      <FlatList
        data={fornosFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={recarregar}
        ListEmptyComponent={<EmptyState texto="Nenhum forno cadastrado ainda." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`${item.assetNumber || 's/ patrimônio'} · ${item.description}`}
            subtitulo={lojasPorId[item.storeId]?.description ?? ''}
            detalhes="Toque para gerenciar as peças deste forno"
            onPress={() => router.push(`/pecas-forno/${item.id}`)}
          />
        )}
      />
    </Screen>
  );
}
