import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { ListRow } from '../../../components/ListRow';
import { PriorityChip } from '../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../components/WorkOrderStatusBadge';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { FilterChip } from '../../../components/FilterChip';
import { Store } from '../../../domain/entities/Store';
import { colors, spacing } from '../../../components/theme';
import { useWorkOrders } from './useWorkOrders';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function OrdensDeServico() {
  const { ordens, lojas, lojasPorId, lojaFiltro, setLojaFiltro, carregando, recarregar } =
    useWorkOrders();

  return (
    <Screen>
      <Text style={styles.rotulo}>Filtrar por loja</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsLista}
        data={[{ id: -1, description: 'Todas' } as Store, ...lojas]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const ativo = item.id === -1 ? lojaFiltro === null : lojaFiltro === item.id;
          return (
            <FilterChip
              texto={item.description}
              selecionado={ativo}
              onPress={() => setLojaFiltro(item.id === -1 ? null : item.id)}
              style={styles.chip}
            />
          );
        }}
      />

      <FlatList
        style={styles.lista}
        data={ordens}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={recarregar}
        ListEmptyComponent={<EmptyState texto="Nenhuma ordem de serviço encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`OS #${item.id} · ${lojasPorId[item.storeId]?.description ?? ''}`}
            subtitulo={lojasPorId[item.storeId]?.address}
            detalhes={formatarData(item.createdAt)}
            badgeNode={
              <View style={styles.badges}>
                <PriorityChip prioridade={item.priority} />
                <WorkOrderStatusBadge status={item.status} />
              </View>
            }
            onPress={() => router.push(`/ordem-de-servico/${item.id}`)}
          />
        )}
      />

      <PrimaryButton
        titulo="+ Nova ordem de serviço"
        onPress={() => router.push('/ordem-de-servico/nova-ordem')}
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
  badges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  chip: { marginRight: spacing.sm },
});
