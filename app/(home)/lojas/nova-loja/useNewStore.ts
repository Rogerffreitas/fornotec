import { useState } from 'react';
import { router } from 'expo-router';
import { storeUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UseNewStoreResult {
  description: string;
  setDescription: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactNumber: string;
  setContactNumber: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  salvando: boolean;
  erro: string | null;
  salvar: () => Promise<void>;
}

/** Valida e cria uma loja — a tela (`index.tsx`) só monta a UI. */
export function useNewStore(): UseNewStoreResult {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    if (!description.trim() || !address.trim()) {
      setErro('Descrição e endereço são obrigatórios.');
      return;
    }
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      setErro('Informe um e-mail válido.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await storeUseCase.create(user!.enterpriseId, {
        description: description.trim(),
        address: address.trim(),
        contactName: contactName.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
        email: email.trim() || undefined,
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return {
    description,
    setDescription,
    address,
    setAddress,
    contactName,
    setContactName,
    contactNumber,
    setContactNumber,
    email,
    setEmail,
    salvando,
    erro,
    salvar,
  };
}
