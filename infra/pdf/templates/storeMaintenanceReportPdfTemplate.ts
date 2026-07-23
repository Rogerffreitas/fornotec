import { Store } from '../../../domain/entities/Store';
import { DocumentDefinitions } from '../../../domain/application/infra/DocumentDefinitions';
import {
  MaintenanceReportOvenItem,
  REPORT_COLUMNS,
  formatarData,
  linhaForno,
  ultimaManutencaoPorPeca,
} from './maintenanceReportPdfTemplate';

export interface StoreMaintenanceReportParams {
  loja: Store | null;
  enterpriseName: string;
  itens: MaintenanceReportOvenItem[];
}

const ANALYTIC_SUB_COLUMNS = [
  { header: 'Data', weight: 0.8 },
  { header: 'OS', weight: 0.5 },
  { header: 'Serviço', weight: 1 },
  { header: 'Observação', weight: 2 },
];

function infoBoxBase(loja: Store | null) {
  return [
    { label: 'Loja', value: loja ? `${loja.description}` : 'Não encontrada' },
    { label: 'Endereço', value: loja ? `${loja.address}` : 'Não encontrada' },
    { label: 'Data de emissão', value: formatarData(new Date().toISOString()) },
  ];
}

/**
 * Relatório Sintético: para cada forno da loja (uma página por forno), uma linha por
 * peça cadastrada com os dados da manutenção mais recente feita nela (data/OS/serviço/
 * observação) — reaproveita a tabela do relatório por ordem de serviço
 * (`maintenanceReportPdfTemplate`), agora agregando todos os fornos da loja.
 */
export function buildSyntheticStoreReportPdfDocument(
  params: StoreMaintenanceReportParams,
): DocumentDefinitions {
  const { loja, itens } = params;

  const sections = itens.map(({ oven, pecas, historico }, index) => {
    const ultimaPorPeca = ultimaManutencaoPorPeca(historico);
    const pecasOrdenadas = [...pecas].sort((a, b) => a.reference.localeCompare(b.reference));

    const rows = pecasOrdenadas.map((peca) => {
      const ultima = ultimaPorPeca.get(peca.id);
      return [
        peca.reference,
        peca.description,
        ultima ? formatarData(ultima.maintenanceDate) : '—',
        ultima ? `${ultima.orderId}` : '—',
        ultima ? ultima.serviceType : '—',
        ultima ? ultima.observation || 'Sem observação' : '—',
      ];
    });

    return {
      heading: linhaForno(oven),
      lines: pecas.length === 0 ? ['Nenhuma peça cadastrada neste forno.'] : [],
      table: pecas.length > 0 ? { columns: REPORT_COLUMNS, rows } : undefined,
      pageBreakBefore: index > 0,
    };
  });

  return {
    title: 'Relatório de Manutenção — Sintético',
    subtitle: '',
    infoBox: infoBoxBase(loja),
    sections,
  };
}

/**
 * Relatório Analítico: para cada forno da loja (uma página por forno), a lista de peças
 * cadastradas (referência/descrição) e, como subitem de cada peça, todo o histórico de
 * ordens de serviço que a atenderam (data/OS/serviço/observação) — não só a mais recente.
 */
export function buildAnalyticStoreReportPdfDocument(
  params: StoreMaintenanceReportParams,
): DocumentDefinitions {
  const { loja, itens } = params;

  const sections = itens.map(({ oven, pecas, historico }, index) => {
    const pecasOrdenadas = [...pecas].sort((a, b) => a.reference.localeCompare(b.reference));

    const subsections = pecasOrdenadas.map((peca) => {
      const entradas = historico
        .filter((m) => m.partId === peca.id)
        .sort((a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime());

      return {
        heading: `${peca.reference} — ${peca.description}`,
        lines: entradas.length === 0 ? ['Nenhuma manutenção registrada nesta peça.'] : [],
        table:
          entradas.length > 0
            ? {
                columns: ANALYTIC_SUB_COLUMNS,
                rows: entradas.map((m) => [
                  formatarData(m.maintenanceDate),
                  `${m.orderId}`,
                  m.serviceType,
                  m.observation || 'Sem observação',
                ]),
              }
            : undefined,
      };
    });

    return {
      heading: linhaForno(oven),
      lines: pecas.length === 0 ? ['Nenhuma peça cadastrada neste forno.'] : [],
      subsections,
      pageBreakBefore: index > 0,
    };
  });

  return {
    title: 'Relatório de Manutenção — Analítico',
    subtitle: '',
    infoBox: infoBoxBase(loja),
    sections,
  };
}
