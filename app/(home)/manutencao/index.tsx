import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { ListRow } from '../../../components/ListRow';
import { PriorityChip } from '../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../components/WorkOrderStatusBadge';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { FilterChip } from '../../../components/FilterChip';
import { colors, spacing } from '../../../components/theme';
import { useMaintenanceOrders } from './useMaintenanceOrders';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Manutencoes() {
  const { ordens, lojas, lojasPorId, lojaFiltro, setLojaFiltro, carregando, recarregar } =
    useMaintenanceOrders();

  return (
    <Screen>
      <Text style={styles.rotulo}>Loja</Text>
      <View style={styles.chips}>
        <FilterChip
          texto="Todas"
          selecionado={lojaFiltro === null}
          onPress={() => setLojaFiltro(null)}
        />
        {lojas.map((loja) => (
          <FilterChip
            key={loja.id}
            texto={loja.description}
            selecionado={lojaFiltro === loja.id}
            onPress={() => setLojaFiltro(loja.id)}
          />
        ))}
      </View>

      <FlatList
        style={styles.lista}
        data={ordens}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={recarregar}
        ListEmptyComponent={
          <EmptyState texto="Nenhuma ordem de serviço finalizada ou com manutenção registrada." />
        }
        renderItem={({ item }) => (
          <ListRow
            titulo={`OS #${item.id} · ${lojasPorId[item.storeId]?.description ?? ''}`}
            subtitulo={formatarData(item.createdAt)}
            badgeNode={
              <View style={styles.badges}>
                <PriorityChip prioridade={item.priority} />
                <WorkOrderStatusBadge status={item.status} />
              </View>
            }
            onPress={() => router.push(`/manutencao/${item.id}`)}
          />
        )}
      />

      <PrimaryButton
        titulo="+ Nova manutenção"
        onPress={() => router.push('/manutencao/nova-manutencao')}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  lista: { flex: 1 },
  badges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
});
