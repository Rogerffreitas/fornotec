import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { Store } from '../../../domain/entities/Store';
import { Maintenance } from '../../../domain/entities/Maintenance';
import {
  storeUseCase,
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
  pdfGenerator,
} from '../../../infra/ioc/container';
import { MaintenanceReportOvenItem } from '../../../infra/pdf/templates/maintenanceReportPdfTemplate';
import {
  buildAnalyticStoreReportPdfDocument,
  buildSyntheticStoreReportPdfDocument,
} from '../../../infra/pdf/templates/storeMaintenanceReportPdfTemplate';
import { baixarPdfNaWeb } from '../../../infra/pdf/baixarPdfNaWeb';
import { useAuth } from '@/context/AuthContext';

export type TipoRelatorio = 'analitico' | 'sintetico';

export interface UseStoreReportsResult {
  lojas: Store[];
  lojaId: number | null;
  setLojaId: (id: number) => void;
  gerando: TipoRelatorio | null;
  gerar: (tipo: TipoRelatorio) => Promise<void>;
}

/** Carrega as lojas e gera o relatório de manutenção (analítico/sintético) escolhido — a tela (`index.tsx`) só monta a UI. */
export function useStoreReports(): UseStoreReportsResult {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [gerando, setGerando] = useState<TipoRelatorio | null>(null);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then(setLojas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loja = lojas.find((l) => l.id === lojaId) ?? null;

  async function montarItens(): Promise<MaintenanceReportOvenItem[]> {
    const enterpriseId = user!.enterpriseId;
    const [fornosDaLoja, manutencoesDaLoja] = await Promise.all([
      ovenUseCase.findByStore(enterpriseId, lojaId as number),
      maintenanceUseCase.findByStore(enterpriseId, lojaId as number),
    ]);

    return Promise.all(
      fornosDaLoja.map(async (oven) => {
        const associacoes = await ovenUseCase.findPartsOfOven(enterpriseId, oven.id);
        const pecas = associacoes.length
          ? await partUseCase.findByIds(
              enterpriseId,
              associacoes.map((a) => a.partId),
            )
          : [];
        const historico: Maintenance[] = manutencoesDaLoja.filter((m) => m.ovenId === oven.id);
        return { oven, pecas, historico };
      }),
    );
  }

  async function gerar(tipo: TipoRelatorio) {
    if (!lojaId) return;
    setGerando(tipo);
    try {
      const itens = await montarItens();
      const documento =
        tipo === 'sintetico'
          ? buildSyntheticStoreReportPdfDocument({ loja, enterpriseName: user!.enterpriseName, itens })
          : buildAnalyticStoreReportPdfDocument({ loja, enterpriseName: user!.enterpriseName, itens });

      const bytes = await pdfGenerator.generate(documento);
      const sufixo = tipo === 'sintetico' ? 'sintetico' : 'analitico';
      if (Platform.OS === 'web') {
        await baixarPdfNaWeb(bytes, `relatorio-manutencao-${sufixo}-loja-${lojaId}.pdf`);
      } else {
        Alert.alert(
          'Disponível na web',
          'O download de PDF está disponível na versão web do app por enquanto.',
        );
      }
    } finally {
      setGerando(null);
    }
  }

  return { lojas, lojaId, setLojaId, gerando, gerar };
}
