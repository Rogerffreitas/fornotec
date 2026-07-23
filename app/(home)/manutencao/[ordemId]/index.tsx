import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { PriorityChip } from '../../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../../components/WorkOrderStatusBadge';
import { ServiceTypeChip } from '../../../../components/ServiceTypeChip';
import { EmptyState } from '../../../../components/EmptyState';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { colors, spacing, radius } from '../../../../components/theme';
import { useOrderMaintenance } from './useOrderMaintenance';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function ManutencaoDaOrdem() {
  const {
    id,
    ordem,
    loja,
    fornosDaOrdem,
    pecasPorId,
    manutencoesPorForno,
    gerandoRelatorio,
    excluindoId,
    excluir,
    baixarRelatorio,
  } = useOrderMaintenance();

  return (
    <Screen>
      <Stack.Screen options={{ title: `Manutenção OS #${id}` }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {ordem ? (
          <View style={styles.resumo}>
            <View>
              <Text style={styles.resumoTitulo}>{loja?.description ?? ''}</Text>
              <Text style={styles.resumoTexto}>{formatarData(ordem.createdAt)}</Text>
            </View>
            <View style={styles.badges}>
              <PriorityChip prioridade={ordem.priority} />
              <WorkOrderStatusBadge status={ordem.status} />
            </View>
          </View>
        ) : null}

        <PrimaryButton
          titulo="Baixar relatório de manutenção"
          variante="secundaria"
          onPress={baixarRelatorio}
          carregando={gerandoRelatorio}
          desabilitado={fornosDaOrdem.length === 0}
          style={{ marginBottom: spacing.md }}
        />

        {fornosDaOrdem.length === 0 ? (
          <EmptyState texto="Nenhum forno nesta ordem." />
        ) : (
          fornosDaOrdem.map((forno) => {
            const itens = manutencoesPorForno[forno.id] ?? [];
            return (
              <View key={forno.id} style={styles.fornoBloco}>
                <Text style={styles.secao}>
                  {forno.assetNumber || 's/ patrimônio'} · {forno.description}
                </Text>
                {itens.length === 0 ? (
                  <EmptyState texto="Nenhuma manutenção registrada neste forno." />
                ) : (
                  itens.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemCabecalho}>
                        <Text style={styles.itemTexto}>
                          {pecasPorId[item.partId]?.reference ?? ''} ·{' '}
                          {pecasPorId[item.partId]?.description ?? 'Peça'}
                        </Text>
                        <ServiceTypeChip tipo={item.serviceType} />
                      </View>
                      {item.observation ? (
                        <Text style={styles.itemObs}>{item.observation}</Text>
                      ) : null}
                      <View style={styles.itemRodape}>
                        <Text style={styles.itemData}>{formatarData(item.maintenanceDate)}</Text>
                        <Pressable
                          onPress={() => excluir(item)}
                          disabled={excluindoId === item.id}
                          hitSlop={8}
                        >
                          <Text style={styles.itemExcluir}>
                            {excluindoId === item.id ? 'Excluindo…' : 'Excluir'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  resumo: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  resumoTitulo: { fontSize: 15, fontWeight: '600', color: colors.text },
  resumoTexto: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badges: { flexDirection: 'row', gap: spacing.xs },
  fornoBloco: { marginBottom: spacing.lg },
  secao: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  item: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemTexto: { fontSize: 13, fontWeight: '600', color: colors.text, flexShrink: 1 },
  itemObs: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  itemRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemData: { fontSize: 11, color: colors.textSecondary },
  itemExcluir: { fontSize: 11, fontWeight: '600', color: colors.danger },
});
