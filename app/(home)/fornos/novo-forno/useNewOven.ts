import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Store } from '../../../../domain/entities/Store';
import { storeUseCase, ovenUseCase } from '../../../../infra/ioc/container';
import { useAuth } from '@/context/AuthContext';

export interface UseNewOvenResult {
  lojas: Store[];
  storeId: number | null;
  setStoreId: (id: number) => void;
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

/** Carrega as lojas, valida e cria um forno — a tela (`index.tsx`) só monta a UI. */
export function useNewOven(): UseNewOvenResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [assetNumber, setAssetNumber] = useState('');
  const [description, setDescription] = useState('');
  const [mark, setMark] = useState('');
  const [voltage, setVoltage] = useState('');
  const [power, setPower] = useState('');
  const [reference, setReference] = useState('');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState('90');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then((resultado) => {
      setLojas(resultado);
      setStoreId(resultado[0]?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar() {
    const frequenciaNumero = Number(maintenanceFrequency);
    if (!storeId || !description.trim() || !(frequenciaNumero > 0)) {
      setErro('Escolha a loja, informe a descrição e a periodicidade de manutenção.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await ovenUseCase.create(user!.enterpriseId, {
        storeId,
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
    lojas,
    storeId,
    setStoreId,
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
