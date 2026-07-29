import { useCallback, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LocationRef } from '../../../../domain/types';
import { partUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseEditPartResult {
  carregado: boolean;
  naoEncontrado: boolean;
  description: string;
  setDescription: (v: string) => void;
  location: LocationRef | null;
  setLocation: (v: LocationRef) => void;
  salvando: boolean;
  erro: string | null;
  salvar: () => Promise<void>;
}

/** Carrega, valida e salva a edição de uma peça — a tela (`index.tsx`) só monta a UI. */
export function useEditPart(): UseEditPartResult {
  const { user } = useAuth();
  const { pecaId } = useLocalSearchParams<{ pecaId: string }>();
  const id = Number(pecaId);

  const [carregado, setCarregado] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationRef | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const peca = await partUseCase.findById(user!.enterpriseId, id);
    if (!peca) {
      setNaoEncontrado(true);
      setCarregado(true);
      return;
    }
    setDescription(peca.description);
    setLocation(peca.location);
    setCarregado(true);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function salvar() {
    if (!description.trim() || !location) {
      setErro('Preencha a descrição e escolha a localização.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await partUseCase.update(user!.enterpriseId, id, { description: description.trim(), location });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return {
    carregado,
    naoEncontrado,
    description,
    setDescription,
    location,
    setLocation,
    salvando,
    erro,
    salvar,
  };
}
