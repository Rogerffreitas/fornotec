import React from 'react';
import { Text, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { FilterChip } from '../../../components/FilterChip';
import { colors, spacing } from '../../../components/theme';
import { useOvens } from './useOvens';

function formatarData(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Fornos() {
  const { lojas, storeId, setStoreId, fornos, filtro, handleFiltro, carregando, recarregar } =
    useOvens();

  return (
    <Screen>
      <Text style={styles.rotulo}>Loja</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={lojas}
        keyExtractor={(item) => String(item.id)}
        style={styles.chipsLista}
        renderItem={({ item }) => (
          <FilterChip
            texto={item.description}
            selecionado={storeId === item.id}
            onPress={() => setStoreId(item.id)}
            style={styles.chip}
          />
        )}
      />

      <FilterInput
        valor={filtro}
        aoMudar={handleFiltro}
        placeholder="Filtrar por descrição ou patrimônio..."
      />

      <FlatList
        style={styles.lista}
        data={fornos}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={recarregar}
        ListEmptyComponent={<EmptyState texto="Nenhum forno cadastrado para esta loja." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`${item.assetNumber || 's/ patrimônio'} · ${item.description}`}
            subtitulo={[item.mark, item.voltage, item.power].filter(Boolean).join(' · ')}
            detalhes={`Última manutenção: ${formatarData(item.lastMaintenance)}  ·  Próxima: ${formatarData(item.nextMaintenance)}`}
            onPress={() => router.push(`/fornos/${item.id}`)}
          />
        )}
      />

      <PrimaryButton
        titulo="+ Novo forno"
        onPress={() => router.push('/fornos/novo-forno')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipsLista: { flexGrow: 0, marginBottom: spacing.md },
  lista: { flex: 1 },
  chip: { marginRight: spacing.sm },
});
