import React, { useCallback, useState } from 'react';
import { View, Text, Platform, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../../components/Screen';
import { ListRow } from '../../../../components/ListRow';
import { EmptyState } from '../../../../components/EmptyState';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { WorkOrder } from '../../../../domain/entities/WorkOrder';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';
import { WorkOrderOven } from '../../../../domain/entities/WorkOrder';
import {
  workOrderUseCase,
  ovenUseCase,
  storeUseCase,
  pdfGenerator,
} from '../../../../infra/ioc/container';
import { colors, spacing } from '../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

async function baixarPdfNaWeb(bytes: Uint8Array, nomeArquivo: string) {
  // @ts-ignore -- globais de navegador, disponíveis apenas quando Platform.OS === 'web'
  const blob = new Blob([bytes], { type: 'application/pdf' });
  // @ts-ignore
  const url = URL.createObjectURL(blob);
  // @ts-ignore
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  // @ts-ignore
  URL.revokeObjectURL(url);
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

  async function finalizar() {
    setFinalizando(true);
    try {
      await workOrderUseCase.finalize(user!.enterpriseId, id);
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
      const bytes = await pdfGenerator.generate({
        title: `Ordem de Serviço #${ordem.id}`,
        subtitle: `${loja?.description ?? ''} · ${formatarData(ordem.createdAt)} · ${ordem.status}`,
        sections: itens.map(({ orderOven, oven }) => ({
          heading: `${oven.assetNumber || 's/ patrimônio'} · ${oven.description}`,
          lines: [orderOven.observation || 'Sem observação'],
        })),
      });
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

  return (
    <Screen>
      <Stack.Screen options={{ title: `OS #${id}` }} />

      {ordem ? (
        <View style={styles.resumo}>
          <Text style={styles.resumoTexto}>
            {formatarData(ordem.createdAt)} · {ordem.status}
          </Text>
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
            detalhes="Toque para registrar manutenção neste forno"
            onPress={() => router.push(`/ordem-de-servico/${id}/forno/${oven.id}`)}
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
          <PrimaryButton
            titulo="Finalizar ordem"
            onPress={finalizar}
            carregando={finalizando}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            titulo="Cancelar ordem"
            variante="perigo"
            onPress={cancelar}
            carregando={cancelando}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  resumo: { marginBottom: spacing.md },
  resumoTexto: { fontSize: 13, color: colors.textSecondary },
  secao: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  acoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
