import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Oven } from '../../../domain/entities/Oven';
import { Store } from '../../../domain/entities/Store';
import { ovenUseCase, storeUseCase } from '../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseOvensForPartsResult {
  fornosFiltrados: Oven[];
  lojasPorId: Record<number, Store>;
  filtro: string;
  setFiltro: (texto: string) => void;
  carregando: boolean;
  recarregar: () => void;
}

/** Carrega fornos/lojas e filtra localmente por descrição — a tela só monta a UI. */
export function useOvensForParts(): UseOvensForPartsResult {
  const { user } = useAuth();
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [lojasPorId, setLojasPorId] = useState<Record<number, Store>>({});
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [listaFornos, listaLojas] = await Promise.all([
      ovenUseCase.findAll(user!.enterpriseId),
      storeUseCase.findAll(user!.enterpriseId),
    ]);
    setFornos(listaFornos);
    setLojasPorId(Object.fromEntries(listaLojas.map((l) => [l.id, l])));
    setCarregando(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const fornosFiltrados = filtro.trim()
    ? fornos.filter((f) => f.description.toLowerCase().includes(filtro.trim().toLowerCase()))
    : fornos;

  return { fornosFiltrados, lojasPorId, filtro, setFiltro, carregando, recarregar: carregar };
}
