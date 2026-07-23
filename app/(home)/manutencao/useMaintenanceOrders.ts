import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { WorkOrder } from '../../../domain/entities/WorkOrder';
import { Store } from '../../../domain/entities/Store';
import { workOrderUseCase, storeUseCase, maintenanceUseCase } from '../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseMaintenanceOrdersResult {
  ordens: WorkOrder[];
  lojas: Store[];
  lojasPorId: Record<number, Store>;
  lojaFiltro: number | null;
  setLojaFiltro: (storeId: number | null) => void;
  carregando: boolean;
  recarregar: () => void;
}

/**
 * Carrega ordens finalizadas ou com manutenção já registrada, filtráveis por loja — a tela
 * (`index.tsx`) só monta a UI.
 */
export function useMaintenanceOrders(): UseMaintenanceOrdersResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState<number | null>(null);
  const [ordens, setOrdens] = useState<WorkOrder[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(
    async (storeId: number | null) => {
      setCarregando(true);
      const enterpriseId = user!.enterpriseId;
      const [listaOrdens, listaLojas, manutencoes] = await Promise.all([
        workOrderUseCase.findWithFilter(enterpriseId, storeId ?? undefined),
        storeUseCase.findAll(enterpriseId),
        maintenanceUseCase.findAll(enterpriseId),
      ]);
      const ordensComManutencao = new Set(manutencoes.map((m) => m.orderId));
      setOrdens(
        listaOrdens.filter((o) => o.status === 'finalizada' || ordensComManutencao.has(o.id)),
      );
      setLojas(listaLojas);
      setCarregando(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      carregar(lojaFiltro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lojaFiltro]),
  );

  const lojasPorId = Object.fromEntries(lojas.map((l) => [l.id, l]));

  return {
    ordens,
    lojas,
    lojasPorId,
    lojaFiltro,
    setLojaFiltro,
    carregando,
    recarregar: () => carregar(lojaFiltro),
  };
}
