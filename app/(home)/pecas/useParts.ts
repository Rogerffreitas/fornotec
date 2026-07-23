import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Part } from '../../../domain/entities/Part';
import { partUseCase } from '../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UsePartsResult {
  pecas: Part[];
  filtro: string;
  carregando: boolean;
  handleFiltro: (texto: string) => void;
  recarregar: () => void;
}

/** Carrega/filtra as peças desta tela (`index.tsx`) — a tela só monta a UI. */
export function useParts(): UsePartsResult {
  const { user } = useAuth();
  const [pecas, setPecas] = useState<Part[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(
    async (texto: string) => {
      setCarregando(true);
      setPecas(await partUseCase.findWithFilter(user!.enterpriseId, texto));
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

  return { pecas, filtro, carregando, handleFiltro, recarregar };
}
