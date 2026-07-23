import { useCallback, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Part } from '../../../../domain/entities/Part';
import { partUseCase, ovenUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseOvenPartsResult {
  pecasJaLigadas: Part[];
  pecasDisponiveis: Part[];
  selecionadas: number[];
  alternarSelecao: (partId: number) => void;
  salvando: boolean;
  salvar: () => Promise<void>;
}

/** Carrega peças já ligadas/disponíveis do forno e associa as selecionadas — a tela (`index.tsx`) só monta a UI. */
export function useOvenParts(): UseOvenPartsResult {
  const { user } = useAuth();
  const { fornoId } = useLocalSearchParams<{ fornoId: string }>();
  const id = Number(fornoId);

  const [todasPecas, setTodasPecas] = useState<Part[]>([]);
  const [idsJaLigados, setIdsJaLigados] = useState<number[]>([]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const [todas, associacoes] = await Promise.all([
      partUseCase.findAll(user!.enterpriseId),
      ovenUseCase.findPartsOfOven(user!.enterpriseId, id),
    ]);
    setTodasPecas(todas);
    setIdsJaLigados(associacoes.map((a) => a.partId));
    setSelecionadas([]);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function alternarSelecao(partId: number) {
    setSelecionadas((atual) =>
      atual.includes(partId) ? atual.filter((i) => i !== partId) : [...atual, partId],
    );
  }

  async function salvar() {
    if (!selecionadas.length) return;
    setSalvando(true);
    try {
      await ovenUseCase.addPartsToOven(user!.enterpriseId, id, selecionadas);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  const pecasJaLigadas = todasPecas.filter((p) => idsJaLigados.includes(p.id));
  const pecasDisponiveis = todasPecas.filter((p) => !idsJaLigados.includes(p.id));

  return { pecasJaLigadas, pecasDisponiveis, selecionadas, alternarSelecao, salvando, salvar };
}
