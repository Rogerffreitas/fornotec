import React, { useCallback, useState } from 'react';
import { View, Text, Platform, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../../components/Screen';
import { ListRow } from '../../../../components/ListRow';
import { PriorityChip } from '../../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../../components/WorkOrderStatusBadge';
import { EmptyState } from '../../../../components/EmptyState';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { AssinaturaModal } from '../../../../components/AssinaturaModal';
import { WorkOrder } from '../../../../domain/entities/WorkOrder';
import { AssinaturaCliente } from '../../../../domain/entities/Signature';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';
import { WorkOrderOven } from '../../../../domain/entities/WorkOrder';
import {
  workOrderUseCase,
  ovenUseCase,
  storeUseCase,
  maintenanceUseCase,
  partUseCase,
  pdfGenerator,
} from '../../../../infra/ioc/container';
import { buildWorkOrderPdfDocument } from '../../../../infra/pdf/templates/workOrderPdfTemplate';
import { baixarPdfNaWeb } from '../../../../infra/pdf/baixarPdfNaWeb';
import { podeGerenciarOrdem } from '../../../../domain/types/permissions';
import { colors, spacing } from '../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function DetalheOrdem() {
  const { user } = useAuth();
  const { ordemId } = useLocalSearchParams<{ ordemId: string }>();
  const id = Number(ordemId);

  const [ordem, setOrdem] = useState<WorkOrder | null>(null);
  const [loja, setLoja] = useState<Store | null>(null);
  const [itens, setItens] = useState<{ orderOven: WorkOrderOven; oven: Oven }[]>([]);
  const [finalizando, setFinalizando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [modalAssinaturaVisivel, setModalAssinaturaVisivel] = useState(false);

  const carregar = useCallback(async () => {
    const enterpriseId = user!.enterpriseId;
    const ordemAtual = await workOrderUseCase.findById(enterpriseId, id);
    setOrdem(ordemAtual ?? null);
    if (ordemAtual) setLoja((await storeUseCase.findById(enterpriseId, ordemAtual.storeId)) ?? null);

    const orderOvens = await workOrderUseCase.findOvensOfOrder(enterpriseId, id);
    const comFornos = await Promise.all(
      orderOvens.map(async (oo) => ({
        orderOven: oo,
        oven: (await ovenUseCase.findById(enterpriseId, oo.ovenId))!,
      })),
    );
    setItens(comFornos.filter((i) => i.oven));
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function finalizar(assinatura: AssinaturaCliente) {
    setFinalizando(true);
    try {
      await workOrderUseCase.finalize(user!.enterpriseId, id, assinatura);
      setModalAssinaturaVisivel(false);
      await carregar();
    } finally {
      setFinalizando(false);
    }
  }

  async function cancelar() {
    setCancelando(true);
    try {
      await workOrderUseCase.cancel(user!.enterpriseId, id);
      await carregar();
    } finally {
      setCancelando(false);
    }
  }

  async function baixarPdf() {
    if (!ordem) return;
    setGerandoPdf(true);
    try {
      const enterpriseId = user!.enterpriseId;
      const manutencoes = await maintenanceUseCase.findByOrder(enterpriseId, id);
      const partIds = [...new Set(manutencoes.map((m) => m.partId))];
      const pecas = partIds.length > 0 ? await partUseCase.findByIds(enterpriseId, partIds) : [];

      const documento = buildWorkOrderPdfDocument({
        ordem,
        loja,
        enterpriseName: user!.enterpriseName,
        pecas,
        itens: itens.map(({ orderOven, oven }) => ({
          orderOven,
          oven,
          manutencoes: manutencoes.filter((m) => m.ovenId === oven.id),
        })),
      });
      const bytes = await pdfGenerator.generate(documento);
      if (Platform.OS === 'web') {
        await baixarPdfNaWeb(bytes, `ordem-servico-${ordem.id}.pdf`);
      } else {
        Alert.alert(
          'Disponível na web',
          'O download de PDF está disponível na versão web do app por enquanto.',
        );
      }
    } finally {
      setGerandoPdf(false);
    }
  }

  const podeGerenciar = podeGerenciarOrdem(user!.role);

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
              onPress={() => setModalAssinaturaVisivel(true)}
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
        onCancelar={() => setModalAssinaturaVisivel(false)}
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
