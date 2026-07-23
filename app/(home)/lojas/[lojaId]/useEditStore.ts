import { useCallback, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { storeUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UseEditStoreResult {
  carregado: boolean;
  naoEncontrada: boolean;
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

/** Carrega, valida e salva a edição de uma loja — a tela (`index.tsx`) só monta a UI. */
export function useEditStore(): UseEditStoreResult {
  const { user } = useAuth();
  const { lojaId } = useLocalSearchParams<{ lojaId: string }>();
  const id = Number(lojaId);

  const [carregado, setCarregado] = useState(false);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const loja = await storeUseCase.findById(user!.enterpriseId, id);
    if (!loja) {
      setNaoEncontrada(true);
      setCarregado(true);
      return;
    }
    setDescription(loja.description);
    setAddress(loja.address);
    setContactName(loja.contactName ?? '');
    setContactNumber(loja.contactNumber ?? '');
    setEmail(loja.email ?? '');
    setCarregado(true);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

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
      await storeUseCase.update(user!.enterpriseId, id, {
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
    carregado,
    naoEncontrada,
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
