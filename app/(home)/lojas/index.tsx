import React from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { spacing } from '../../../components/theme';
import { useStores } from './useStores';

export default function Lojas() {
  const { lojas, filtro, carregando, handleFiltro, recarregar } = useStores();

  return (
    <Screen>
      <FilterInput valor={filtro} aoMudar={handleFiltro} placeholder="Filtrar por descrição..." />
      <FlatList
        data={lojas}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={recarregar}
        ListEmptyComponent={<EmptyState texto="Nenhuma loja encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={item.description}
            subtitulo={item.address}
            detalhes={[item.contactName, item.contactNumber, item.email].filter(Boolean).join(' · ')}
            onPress={() => router.push(`/lojas/${item.id}`)}
          />
        )}
      />
      <PrimaryButton
        titulo="+ Nova loja"
        onPress={() => router.push('/lojas/nova-loja')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
