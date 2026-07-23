import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../../domain/entities/Store';
import { storeUseCase } from '../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseStoresResult {
  lojas: Store[];
  filtro: string;
  carregando: boolean;
  handleFiltro: (texto: string) => void;
  recarregar: () => void;
}

/** Carrega/filtra as lojas desta tela (`index.tsx`) — a tela só monta a UI. */
export function useStores(): UseStoresResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(
    async (texto: string) => {
      setCarregando(true);
      setLojas(await storeUseCase.findWithFilter(user!.enterpriseId, texto));
      setCarregando(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      carregar(filtro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  function handleFiltro(texto: string) {
    setFiltro(texto);
    carregar(texto);
  }

  function recarregar() {
    carregar(filtro);
  }

  return { lojas, filtro, carregando, handleFiltro, recarregar };
}
