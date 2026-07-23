import { useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { WorkOrder, WorkOrderOven } from '../../../../domain/entities/WorkOrder';
import { AssinaturaCliente } from '../../../../domain/entities/Signature';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';
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
import { useAuth } from '@/context/AuthContext';

export interface UseWorkOrderResult {
  id: number;
  ordem: WorkOrder | null;
  itens: { orderOven: WorkOrderOven; oven: Oven }[];
  podeGerenciar: boolean;
  finalizando: boolean;
  cancelando: boolean;
  gerandoPdf: boolean;
  modalAssinaturaVisivel: boolean;
  abrirModalAssinatura: () => void;
  fecharModalAssinatura: () => void;
  finalizar: (assinatura: AssinaturaCliente) => Promise<void>;
  cancelar: () => Promise<void>;
  baixarPdf: () => Promise<void>;
}

/**
 * Carrega a ordem e seus fornos, e concentra as ações (finalizar/cancelar/baixar PDF) — a tela
 * (`index.tsx`) só monta a UI.
 */
export function useWorkOrder(): UseWorkOrderResult {
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

  return {
    id,
    ordem,
    itens,
    podeGerenciar: podeGerenciarOrdem(user!.role),
    finalizando,
    cancelando,
    gerandoPdf,
    modalAssinaturaVisivel,
    abrirModalAssinatura: () => setModalAssinaturaVisivel(true),
    fecharModalAssinatura: () => setModalAssinaturaVisivel(false),
    finalizar,
    cancelar,
    baixarPdf,
  };
}
