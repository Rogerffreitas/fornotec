import { Oven } from '../../../domain/entities/Oven';
import { Store } from '../../../domain/entities/Store';
import { Part } from '../../../domain/entities/Part';
import { Maintenance } from '../../../domain/entities/Maintenance';
import { DocumentDefinitions } from '../../../domain/application/infra/DocumentDefinitions';

/** Um forno e todo o histórico necessário para montar sua tabela no relatório. */
export interface MaintenanceReportOvenItem {
  oven: Oven;
  /** Todas as peças cadastradas neste forno (ver `ovenUseCase.findPartsOfOven`). */
  pecas: Part[];
  /** Todo o histórico de manutenção deste forno, de qualquer ordem de serviço. */
  historico: Maintenance[];
}

export interface MaintenanceReportTemplateParams {
  loja: Store | null;
  enterpriseName: string;
  /** Ordem de serviço que originou a emissão do relatório (contexto, não filtro do histórico). */
  ordemId: number;
  itens: MaintenanceReportOvenItem[];
}

const REPORT_COLUMNS = [
  { header: 'Referência', weight: 1 },
  { header: 'Descrição', weight: 2.1 },
  { header: 'Data', weight: 0.85 },
  { header: 'OS', weight: 0.5 },
  { header: 'Serviço', weight: 1 },
  { header: 'Observação', weight: 1.9 },
];

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** Para cada peça, a manutenção mais recente registrada nela (de qualquer ordem). */
function ultimaManutencaoPorPeca(historico: Maintenance[]): Map<number, Maintenance> {
  const porPeca = new Map<number, Maintenance>();
  for (const m of historico) {
    const atual = porPeca.get(m.partId);
    if (!atual || new Date(m.maintenanceDate) > new Date(atual.maintenanceDate)) {
      porPeca.set(m.partId, m);
    }
  }
  return porPeca;
}

function linhaForno(oven: Oven): string {
  return `Forno: ${oven.assetNumber || 's/ patrimônio'} — ${oven.description}`;
}

/**
 * Modelo (template) do "Relatório de Manutenção": para cada forno, lista todas as
 * peças cadastradas nele com referência/descrição e os dados da última manutenção
 * feita (data/OS/serviço/observação) — no formato do relatório de referência
 * (`infra/pdf/Guara-Jacarecanga.pdf`). Consumido pela função `baixarRelatorio` da
 * tela `app/(home)/manutencao/[ordemId]/index.tsx`.
 */
export function buildMaintenanceReportPdfDocument(
  params: MaintenanceReportTemplateParams,
): DocumentDefinitions {
  const { loja, ordemId, itens } = params;

  const infoBox = [
    { label: 'Loja', value: loja ? `${loja.description} — ${loja.address}` : 'Não encontrada' },
    { label: 'Ordem de serviço', value: `#${ordemId}` },
    { label: 'Data de emissão', value: formatarData(new Date().toISOString()) },
  ];

  const sections = itens.map(({ oven, pecas, historico }) => {
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
    };
  });

  return {
    title: 'Relatório de Manutenção',
    subtitle: '',
    infoBox,
    sections,
  };
}
