import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { WorkOrder } from '../../../../domain/entities/WorkOrder';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';
import { Part } from '../../../../domain/entities/Part';
import { ServiceType } from '../../../../domain/types';
import {
  workOrderUseCase,
  ovenUseCase,
  storeUseCase,
  partUseCase,
  maintenanceUseCase,
} from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseNewMaintenanceWizardResult {
  ordens: WorkOrder[];
  lojasPorId: Record<number, Store>;
  orderId: number | null;
  setOrderId: (id: number) => void;
  fornosDaOrdem: Oven[];
  ovenId: number | null;
  setOvenId: (id: number) => void;
  pecasDoForno: Part[];
  partId: number | null;
  setPartId: (id: number) => void;
  servico: ServiceType | null;
  setServico: (s: ServiceType) => void;
  observacao: string;
  setObservacao: (v: string) => void;
  salvando: boolean;
  erro: string | null;
  salvar: () => Promise<void>;
}

/**
 * Assistente ordem → forno → peça → serviço para registrar uma manutenção — a tela
 * (`index.tsx`) só monta a UI.
 */
export function useNewMaintenanceWizard(): UseNewMaintenanceWizardResult {
  const { user } = useAuth();
  const [ordens, setOrdens] = useState<WorkOrder[]>([]);
  const [lojasPorId, setLojasPorId] = useState<Record<number, Store>>({});
  const [orderId, setOrderId] = useState<number | null>(null);

  const [fornosDaOrdem, setFornosDaOrdem] = useState<Oven[]>([]);
  const [ovenId, setOvenId] = useState<number | null>(null);

  const [pecasDoForno, setPecasDoForno] = useState<Part[]>([]);
  const [partId, setPartId] = useState<number | null>(null);

  const [servico, setServico] = useState<ServiceType | null>(null);
  const [observacao, setObservacao] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      workOrderUseCase.findAll(user!.enterpriseId),
      storeUseCase.findAll(user!.enterpriseId),
    ]).then(([listaOrdens, lojas]) => {
      setOrdens(listaOrdens.filter((o) => o.status === 'pendente'));
      setLojasPorId(Object.fromEntries(lojas.map((l) => [l.id, l])));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orderId) {
      setFornosDaOrdem([]);
      return;
    }
    workOrderUseCase.findOvensOfOrder(user!.enterpriseId, orderId).then(async (orderOvens) => {
      const fornos = await Promise.all(
        orderOvens.map((oo) => ovenUseCase.findById(user!.enterpriseId, oo.ovenId)),
      );
      setFornosDaOrdem(fornos.filter((f): f is Oven => !!f));
    });
    setOvenId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (!ovenId) {
      setPecasDoForno([]);
      return;
    }
    ovenUseCase.findPartsOfOven(user!.enterpriseId, ovenId).then(async (associacoes) => {
      setPecasDoForno(
        await partUseCase.findByIds(
          user!.enterpriseId,
          associacoes.map((a) => a.partId),
        ),
      );
    });
    setPartId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ovenId]);

  async function salvar() {
    if (!orderId || !ovenId || !partId || !servico) {
      setErro('Escolha a ordem, o forno, a peça e o status.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await maintenanceUseCase.register(user!.enterpriseId, orderId, ovenId, [
        { partId, serviceType: servico, observation: observacao },
      ]);
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return {
    ordens,
    lojasPorId,
    orderId,
    setOrderId,
    fornosDaOrdem,
    ovenId,
    setOvenId,
    pecasDoForno,
    partId,
    setPartId,
    servico,
    setServico,
    observacao,
    setObservacao,
    salvando,
    erro,
    salvar,
  };
}
