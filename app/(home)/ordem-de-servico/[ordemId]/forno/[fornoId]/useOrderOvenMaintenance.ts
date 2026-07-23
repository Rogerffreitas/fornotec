import { useCallback, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Part } from '../../../../../../domain/entities/Part';
import { Maintenance, NewMaintenanceItem } from '../../../../../../domain/entities/Maintenance';
import { ServiceType } from '../../../../../../domain/types';
import {
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
} from '../../../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseOrderOvenMaintenanceResult {
  pecasDoForno: Part[];
  jaRegistradas: Maintenance[];
  partId: number | null;
  setPartId: (id: number) => void;
  servico: ServiceType | null;
  setServico: (s: ServiceType) => void;
  observacao: string;
  setObservacao: (v: string) => void;
  pendentes: NewMaintenanceItem[];
  adicionarItem: () => void;
  removerPendente: (index: number) => void;
  salvando: boolean;
  erro: string | null;
  salvarTudo: () => Promise<void>;
  nomePeca: (id: number) => string;
}

/**
 * Monta uma lista de peças/serviços pendentes e registra tudo de uma vez para o forno desta
 * ordem — a tela (`index.tsx`) só monta a UI.
 */
export function useOrderOvenMaintenance(): UseOrderOvenMaintenanceResult {
  const { user } = useAuth();
  const { ordemId, fornoId } = useLocalSearchParams<{ ordemId: string; fornoId: string }>();
  const orderId = Number(ordemId);
  const ovenId = Number(fornoId);

  const [pecasDoForno, setPecasDoForno] = useState<Part[]>([]);
  const [jaRegistradas, setJaRegistradas] = useState<Maintenance[]>([]);

  const [partId, setPartId] = useState<number | null>(null);
  const [servico, setServico] = useState<ServiceType | null>(null);
  const [observacao, setObservacao] = useState('');
  const [pendentes, setPendentes] = useState<NewMaintenanceItem[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const enterpriseId = user!.enterpriseId;
    const associacoes = await ovenUseCase.findPartsOfOven(enterpriseId, ovenId);
    const [pecas, registradas] = await Promise.all([
      partUseCase.findByIds(
        enterpriseId,
        associacoes.map((a) => a.partId),
      ),
      maintenanceUseCase.findByOrderAndOven(enterpriseId, orderId, ovenId),
    ]);
    setPecasDoForno(pecas);
    setJaRegistradas(registradas);
  }, [ovenId, orderId, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function adicionarItem() {
    if (!partId || !servico) {
      setErro('Escolha a peça e o tipo de serviço.');
      return;
    }
    setErro(null);
    setPendentes((atual) => [...atual, { partId, serviceType: servico, observation: observacao }]);
    setPartId(null);
    setServico(null);
    setObservacao('');
  }

  function removerPendente(index: number) {
    setPendentes((atual) => atual.filter((_, i) => i !== index));
  }

  async function salvarTudo() {
    if (!pendentes.length) {
      setErro('Adicione ao menos uma peça antes de salvar.');
      return;
    }
    setSalvando(true);
    try {
      await maintenanceUseCase.register(user!.enterpriseId, orderId, ovenId, pendentes);
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  function nomePeca(id: number): string {
    const peca = pecasDoForno.find((p) => p.id === id);
    return peca ? `${peca.reference} · ${peca.description}` : `Peça ${id}`;
  }

  return {
    pecasDoForno,
    jaRegistradas,
    partId,
    setPartId,
    servico,
    setServico,
    observacao,
    setObservacao,
    pendentes,
    adicionarItem,
    removerPendente,
    salvando,
    erro,
    salvarTudo,
    nomePeca,
  };
}
