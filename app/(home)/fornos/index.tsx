import React from 'react';
import { Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, radius } from '../../../components/theme';
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
          <Pressable
            onPress={() => setStoreId(item.id)}
            style={[styles.chip, storeId === item.id && styles.chipSelecionado]}
          >
            <Text style={[styles.chipTexto, storeId === item.id && styles.chipTextoSelecionado]}>
              {item.description}
            </Text>
          </Pressable>
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
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
  },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: '600' },
});
