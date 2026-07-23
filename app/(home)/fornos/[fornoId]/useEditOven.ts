import { useCallback, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../../../domain/entities/Store';
import { storeUseCase, ovenUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseEditOvenResult {
  loja: Store | null;
  carregado: boolean;
  naoEncontrado: boolean;
  assetNumber: string;
  setAssetNumber: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  mark: string;
  setMark: (v: string) => void;
  voltage: string;
  setVoltage: (v: string) => void;
  power: string;
  setPower: (v: string) => void;
  reference: string;
  setReference: (v: string) => void;
  maintenanceFrequency: string;
  setMaintenanceFrequency: (v: string) => void;
  salvando: boolean;
  erro: string | null;
  salvar: () => Promise<void>;
}

/** Carrega, valida e salva a edição de um forno — a tela (`index.tsx`) só monta a UI. */
export function useEditOven(): UseEditOvenResult {
  const { user } = useAuth();
  const { fornoId } = useLocalSearchParams<{ fornoId: string }>();
  const id = Number(fornoId);

  const [loja, setLoja] = useState<Store | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [assetNumber, setAssetNumber] = useState('');
  const [description, setDescription] = useState('');
  const [mark, setMark] = useState('');
  const [voltage, setVoltage] = useState('');
  const [power, setPower] = useState('');
  const [reference, setReference] = useState('');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const enterpriseId = user!.enterpriseId;
    const forno = await ovenUseCase.findById(enterpriseId, id);
    if (!forno) {
      setNaoEncontrado(true);
      setCarregado(true);
      return;
    }
    setLoja((await storeUseCase.findById(enterpriseId, forno.storeId)) ?? null);
    setAssetNumber(forno.assetNumber ?? '');
    setDescription(forno.description);
    setMark(forno.mark ?? '');
    setVoltage(forno.voltage ?? '');
    setPower(forno.power ?? '');
    setReference(forno.reference ?? '');
    setMaintenanceFrequency(String(forno.maintenanceFrequency));
    setCarregado(true);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function salvar() {
    const frequenciaNumero = Number(maintenanceFrequency);
    if (!description.trim() || !(frequenciaNumero > 0)) {
      setErro('Informe a descrição e a periodicidade de manutenção.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await ovenUseCase.update(user!.enterpriseId, id, {
        assetNumber: assetNumber.trim() || undefined,
        description: description.trim(),
        mark: mark.trim() || undefined,
        voltage: voltage.trim() || undefined,
        power: power.trim() || undefined,
        reference: reference.trim() || undefined,
        maintenanceFrequency: frequenciaNumero,
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return {
    loja,
    carregado,
    naoEncontrado,
    assetNumber,
    setAssetNumber,
    description,
    setDescription,
    mark,
    setMark,
    voltage,
    setVoltage,
    power,
    setPower,
    reference,
    setReference,
    maintenanceFrequency,
    setMaintenanceFrequency,
    salvando,
    erro,
    salvar,
  };
}
