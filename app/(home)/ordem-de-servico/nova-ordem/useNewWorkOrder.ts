import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Store } from '../../../../domain/entities/Store';
import { Oven } from '../../../../domain/entities/Oven';
import { WorkOrderPriority } from '../../../../domain/types';
import { storeUseCase, ovenUseCase, workOrderUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

interface SelecaoForno {
  selecionado: boolean;
  observacao: string;
}

export interface UseNewWorkOrderResult {
  lojas: Store[];
  storeId: number | null;
  setStoreId: (id: number) => void;
  prioridade: WorkOrderPriority;
  setPrioridade: (p: WorkOrderPriority) => void;
  fornos: Oven[];
  selecoes: Record<number, SelecaoForno>;
  alternarForno: (ovenId: number) => void;
  mudarObservacao: (ovenId: number, texto: string) => void;
  fornosSelecionados: { ovenId: number; observation: string }[];
  salvando: boolean;
  erro: string | null;
  valido: boolean;
  salvar: () => Promise<void>;
}

/** Carrega lojas/fornos, valida e cria a ordem de serviço — a tela (`index.tsx`) só monta a UI. */
export function useNewWorkOrder(): UseNewWorkOrderResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [prioridade, setPrioridade] = useState<WorkOrderPriority>('media');
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [selecoes, setSelecoes] = useState<Record<number, SelecaoForno>>({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then((resultado) => {
      setLojas(resultado);
      setStoreId(resultado[0]?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!storeId) return;
    ovenUseCase.findByStore(user!.enterpriseId, storeId).then((resultado) => {
      setFornos(resultado);
      setSelecoes({});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  function alternarForno(ovenId: number) {
    setSelecoes((atual) => {
      const anterior = atual[ovenId];
      return {
        ...atual,
        [ovenId]: { selecionado: !anterior?.selecionado, observacao: anterior?.observacao ?? '' },
      };
    });
  }

  function mudarObservacao(ovenId: number, texto: string) {
    setSelecoes((atual) => ({ ...atual, [ovenId]: { ...atual[ovenId], observacao: texto } }));
  }

  const fornosSelecionados = Object.entries(selecoes)
    .filter(([, v]) => v.selecionado)
    .map(([ovenId, v]) => ({ ovenId: Number(ovenId), observation: v.observacao }));

  const valido = Boolean(
    storeId && fornosSelecionados.length && fornosSelecionados.every((f) => f.observation.trim()),
  );

  async function salvar() {
    if (!storeId || !fornosSelecionados.length) {
      setErro('Escolha a loja e ao menos um forno para a ordem.');
      return;
    }
    if (fornosSelecionados.some((f) => !f.observation.trim())) {
      setErro('Preencha a observação de cada forno selecionado.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const { order } = await workOrderUseCase.create(
        user!.enterpriseId,
        { storeId, priority: prioridade },
        fornosSelecionados,
      );
      router.replace(`/ordem-de-servico/${order.id}`);
    } finally {
      setSalvando(false);
    }
  }

  return {
    lojas,
    storeId,
    setStoreId,
    prioridade,
    setPrioridade,
    fornos,
    selecoes,
    alternarForno,
    mudarObservacao,
    fornosSelecionados,
    salvando,
    erro,
    valido,
    salvar,
  };
}
