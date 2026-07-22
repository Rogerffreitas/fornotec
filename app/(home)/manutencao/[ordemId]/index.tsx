import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../../components/Screen';
import { PriorityChip } from '../../../../components/PriorityChip';
import { WorkOrderStatusBadge } from '../../../../components/WorkOrderStatusBadge';
import { ServiceTypeChip } from '../../../../components/ServiceTypeChip';
import { EmptyState } from '../../../../components/EmptyState';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { WorkOrder } from '../../../../domain/entities/WorkOrder';
import { Store } from '../../../../domain/entities/Store';
import { Oven } from '../../../../domain/entities/Oven';
import { Part } from '../../../../domain/entities/Part';
import { Maintenance } from '../../../../domain/entities/Maintenance';
import {
  workOrderUseCase,
  storeUseCase,
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
  pdfGenerator,
} from '../../../../infra/ioc/container';
import { buildMaintenanceReportPdfDocument } from '../../../../infra/pdf/templates/maintenanceReportPdfTemplate';
import { baixarPdfNaWeb } from '../../../../infra/pdf/baixarPdfNaWeb';
import { colors, spacing, radius } from '../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** Alert.alert não exibe nada na web (react-native-web só tem um stub vazio) — por isso o confirm nativo do browser ali. */
function confirmarExclusao(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm('Excluir esta manutenção? Esta ação não pode ser desfeita.'));
  }
  return new Promise((resolve) => {
    Alert.alert('Excluir manutenção', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function ManutencaoDaOrdem() {
  const { user } = useAuth();
  const { ordemId } = useLocalSearchParams<{ ordemId: string }>();
  const id = Number(ordemId);

  const [ordem, setOrdem] = useState<WorkOrder | null>(null);
  const [loja, setLoja] = useState<Store | null>(null);
  const [fornosDaOrdem, setFornosDaOrdem] = useState<Oven[]>([]);
  const [pecasPorId, setPecasPorId] = useState<Record<number, Part>>({});
  const [manutencoesPorForno, setManutencoesPorForno] = useState<Record<number, Maintenance[]>>({});
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const enterpriseId = user!.enterpriseId;
    const ordemAtual = await workOrderUseCase.findById(enterpriseId, id);
    setOrdem(ordemAtual ?? null);
    if (ordemAtual)
      setLoja((await storeUseCase.findById(enterpriseId, ordemAtual.storeId)) ?? null);

    const [orderOvens, manutencoes] = await Promise.all([
      workOrderUseCase.findOvensOfOrder(enterpriseId, id),
      maintenanceUseCase.findByOrder(enterpriseId, id),
    ]);
    const fornos = await Promise.all(
      orderOvens.map((oo) => ovenUseCase.findById(enterpriseId, oo.ovenId)),
    );
    setFornosDaOrdem(fornos.filter((f): f is Oven => !!f));

    const pecas = await partUseCase.findByIds(
      enterpriseId,
      manutencoes.map((m) => m.partId),
    );
    setPecasPorId(Object.fromEntries(pecas.map((p) => [p.id, p])));

    const agrupado: Record<number, Maintenance[]> = {};
    manutencoes.forEach((m) => {
      (agrupado[m.ovenId] ??= []).push(m);
    });
    setManutencoesPorForno(agrupado);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function excluir(item: Maintenance) {
    if (!(await confirmarExclusao())) return;
    setExcluindoId(item.id);
    try {
      await maintenanceUseCase.remove(user!.enterpriseId, item.id);
      await carregar();
    } finally {
      setExcluindoId(null);
    }
  }

  async function baixarRelatorio() {
    if (fornosDaOrdem.length === 0) return;
    setGerandoRelatorio(true);
    try {
      const enterpriseId = user!.enterpriseId;
      const todasManutencoes = await maintenanceUseCase.findAll(enterpriseId);

      const itensRelatorio = await Promise.all(
        fornosDaOrdem.map(async (forno) => {
          const associacoes = await ovenUseCase.findPartsOfOven(enterpriseId, forno.id);
          const pecas = associacoes.length
            ? await partUseCase.findByIds(
                enterpriseId,
                associacoes.map((a) => a.partId),
              )
            : [];
          const historico = todasManutencoes.filter((m) => m.ovenId === forno.id);
          return { oven: forno, pecas, historico };
        }),
      );

      const documento = buildMaintenanceReportPdfDocument({
        loja,
        enterpriseName: user!.enterpriseName,
        ordemId: id,
        itens: itensRelatorio,
      });
      const bytes = await pdfGenerator.generate(documento);
      if (Platform.OS === 'web') {
        await baixarPdfNaWeb(bytes, `relatorio-manutencao-os-${id}.pdf`);
      } else {
        Alert.alert(
          'Disponível na web',
          'O download de PDF está disponível na versão web do app por enquanto.',
        );
      }
    } finally {
      setGerandoRelatorio(false);
    }
  }

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
