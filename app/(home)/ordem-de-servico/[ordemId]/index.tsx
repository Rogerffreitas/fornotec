import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { ListRow } from '../../../../components/ListRow';
import { PriorityChip } from '../../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../../components/WorkOrderStatusBadge';
import { EmptyState } from '../../../../components/EmptyState';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { AssinaturaModal } from '../../../../components/AssinaturaModal';
import { colors, spacing } from '../../../../components/theme';
import { useWorkOrder } from './useWorkOrder';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function DetalheOrdem() {
  const {
    id,
    ordem,
    itens,
    podeGerenciar,
    finalizando,
    cancelando,
    gerandoPdf,
    modalAssinaturaVisivel,
    abrirModalAssinatura,
    fecharModalAssinatura,
    finalizar,
    cancelar,
    baixarPdf,
  } = useWorkOrder();

  return (
    <Screen>
      <Stack.Screen options={{ title: `OS #${id}` }} />

      {ordem ? (
        <View style={styles.resumo}>
          <Text style={styles.resumoTexto}>{formatarData(ordem.createdAt)}</Text>
          <View style={styles.badges}>
            <PriorityChip prioridade={ordem.priority} />
            <WorkOrderStatusBadge status={ordem.status} />
          </View>
        </View>
      ) : null}

      <Text style={styles.secao}>Fornos desta ordem</Text>
      {itens.length === 0 ? (
        <EmptyState texto="Nenhum forno nesta ordem." />
      ) : (
        itens.map(({ orderOven, oven }) => (
          <ListRow
            key={orderOven.id}
            titulo={`${oven.assetNumber || 's/ patrimônio'} · ${oven.description}`}
            subtitulo={orderOven.observation}
            detalhes={podeGerenciar ? 'Toque para registrar manutenção neste forno' : undefined}
            onPress={
              podeGerenciar
                ? () => router.push(`/ordem-de-servico/${id}/forno/${oven.id}`)
                : undefined
            }
          />
        ))
      )}

      <PrimaryButton
        titulo="Baixar PDF da ordem"
        variante="secundaria"
        onPress={baixarPdf}
        carregando={gerandoPdf}
        style={{ marginTop: spacing.md }}
      />

      {ordem?.status === 'pendente' ? (
        <View style={styles.acoes}>
          {podeGerenciar ? (
            <PrimaryButton
              titulo="Finalizar ordem"
              onPress={abrirModalAssinatura}
              style={{ flex: 1 }}
            />
          ) : null}
          <PrimaryButton
            titulo="Cancelar ordem"
            variante="perigo"
            onPress={cancelar}
            carregando={cancelando}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}

      <AssinaturaModal
        visivel={modalAssinaturaVisivel}
        carregando={finalizando}
        onCancelar={fecharModalAssinatura}
        onConfirmar={finalizar}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  resumo: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  resumoTexto: { fontSize: 13, color: colors.textSecondary },
  badges: { flexDirection: 'row', gap: spacing.xs },
  secao: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  acoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
