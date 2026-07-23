import React from 'react';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../components/Screen';
import { ListRow } from '../../../components/ListRow';
import { PriorityChip } from '../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../components/WorkOrderStatusBadge';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, spacing, radius } from '../../../components/theme';
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
        <Pressable
          onPress={() => setLojaFiltro(null)}
          style={[styles.chip, lojaFiltro === null && styles.chipSelecionado]}
        >
          <Text style={[styles.chipTexto, lojaFiltro === null && styles.chipTextoSelecionado]}>
            Todas
          </Text>
        </Pressable>
        {lojas.map((loja) => (
          <Pressable
            key={loja.id}
            onPress={() => setLojaFiltro(loja.id)}
            style={[styles.chip, lojaFiltro === loja.id && styles.chipSelecionado]}
          >
            <Text
              style={[styles.chipTexto, lojaFiltro === loja.id && styles.chipTextoSelecionado]}
            >
              {loja.description}
            </Text>
          </Pressable>
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
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: '600' },
});
