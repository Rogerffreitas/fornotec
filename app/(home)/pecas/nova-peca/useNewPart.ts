import { useState } from 'react';
import { router } from 'expo-router';
import { LocationRef } from '../../../../domain/types';
import { partUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseNewPartResult {
  description: string;
  setDescription: (v: string) => void;
  location: LocationRef | null;
  setLocation: (v: LocationRef) => void;
  salvando: boolean;
  erro: string | null;
  salvar: () => Promise<void>;
}

/** Valida e cria uma peça — a tela (`index.tsx`) só monta a UI. */
export function useNewPart(): UseNewPartResult {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationRef | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    if (!description.trim() || !location) {
      setErro('Preencha a descrição e escolha a localização.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await partUseCase.create(user!.enterpriseId, { description: description.trim(), location });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return { description, setDescription, location, setLocation, salvando, erro, salvar };
}
