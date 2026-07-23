import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../../domain/entities/Store';
import { Oven } from '../../../domain/entities/Oven';
import { storeUseCase, ovenUseCase } from '../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseOvensResult {
  lojas: Store[];
  storeId: number | null;
  setStoreId: (id: number) => void;
  fornos: Oven[];
  filtro: string;
  handleFiltro: (texto: string) => void;
  carregando: boolean;
  recarregar: () => void;
}

/** Carrega lojas/fornos e aplica o filtro desta tela (`index.tsx`) — a tela só monta a UI. */
export function useOvens(): UseOvensResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then((resultado) => {
      setLojas(resultado);
      setStoreId((atual) => atual ?? resultado[0]?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregar = useCallback(
    async (id: number, texto: string) => {
      setCarregando(true);
      setFornos(await ovenUseCase.findByStore(user!.enterpriseId, id, texto));
      setCarregando(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      if (storeId) carregar(storeId, filtro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeId]),
  );

  function handleFiltro(texto: string) {
    setFiltro(texto);
    if (storeId) carregar(storeId, texto);
  }

  function recarregar() {
    if (storeId) carregar(storeId, filtro);
  }

  return { lojas, storeId, setStoreId, fornos, filtro, handleFiltro, carregando, recarregar };
}
