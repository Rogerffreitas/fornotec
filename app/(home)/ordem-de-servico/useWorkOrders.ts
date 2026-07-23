import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { WorkOrder } from '../../../domain/entities/WorkOrder';
import { Store } from '../../../domain/entities/Store';
import { workOrderUseCase, storeUseCase } from '../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseWorkOrdersResult {
  ordens: WorkOrder[];
  lojas: Store[];
  lojasPorId: Record<number, Store>;
  lojaFiltro: number | null;
  setLojaFiltro: (storeId: number | null) => void;
  carregando: boolean;
  recarregar: () => void;
}

/** Carrega ordens de serviço filtráveis por loja — a tela (`index.tsx`) só monta a UI. */
export function useWorkOrders(): UseWorkOrdersResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState<number | null>(null);
  const [ordens, setOrdens] = useState<WorkOrder[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then(setLojas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregar = useCallback(
    async (storeId: number | null) => {
      setCarregando(true);
      setOrdens(await workOrderUseCase.findWithFilter(user!.enterpriseId, storeId ?? undefined));
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
