import { useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
import { useAuth } from '@/context/AuthContext';

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

export interface UseOrderMaintenanceResult {
  id: number;
  ordem: WorkOrder | null;
  loja: Store | null;
  fornosDaOrdem: Oven[];
  pecasPorId: Record<number, Part>;
  manutencoesPorForno: Record<number, Maintenance[]>;
  gerandoRelatorio: boolean;
  excluindoId: number | null;
  excluir: (item: Maintenance) => Promise<void>;
  baixarRelatorio: () => Promise<void>;
}

/**
 * Carrega a ordem, seus fornos e o histórico de manutenção agrupado por forno, e concentra
 * as ações (excluir item, baixar relatório) — a tela (`index.tsx`) só monta a UI.
 */
export function useOrderMaintenance(): UseOrderMaintenanceResult {
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
          const pecasDoForno = associacoes.length
            ? await partUseCase.findByIds(
                enterpriseId,
                associacoes.map((a) => a.partId),
              )
            : [];
          const historico = todasManutencoes.filter((m) => m.ovenId === forno.id);
          return { oven: forno, pecas: pecasDoForno, historico };
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

  return {
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
  };
}
