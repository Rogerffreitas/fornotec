import { WorkOrder, WorkOrderOven } from '../../../domain/entities/WorkOrder';
import { Oven } from '../../../domain/entities/Oven';
import { Store } from '../../../domain/entities/Store';
import { Maintenance } from '../../../domain/entities/Maintenance';
import { Part } from '../../../domain/entities/Part';
import { DocumentDefinitions } from '../../../domain/application/infra/DocumentDefinitions';
import { WORK_ORDER_PRIORITY_LABELS } from '../../../domain/types';

/** Um forno atendido pela ordem, com sua observação e as manutenções já registradas nele. */
export interface WorkOrderPdfOvenItem {
  orderOven: WorkOrderOven;
  oven: Oven;
  manutencoes: Maintenance[];
}

export interface WorkOrderPdfTemplateParams {
  ordem: WorkOrder;
  loja: Store | null;
  enterpriseName: string;
  tecnico: string;
  itens: WorkOrderPdfOvenItem[];
  /** Peças referenciadas pelas manutenções de `itens`, usadas para resolver `partId` -> descrição/referência. */
  pecas: Part[];
}

const STATUS_LABELS: Record<WorkOrder['status'], string> = {
  pendente: 'Pendente',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatarDataHora(data: Date): string {
  return data.toLocaleString('pt-BR');
}

function linhaForno(oven: Oven): string {
  const detalhes = [oven.mark, oven.voltage, oven.power].filter(Boolean).join(' · ');
  const cabecalho = `Forno: ${oven.assetNumber || 's/ patrimônio'} — ${oven.description}`;
  return detalhes ? `${cabecalho} (${detalhes})` : cabecalho;
}

const MANUTENCAO_COLUMNS = [
  { header: 'Referência', weight: 1.1 },
  { header: 'Descrição', weight: 2.4 },
  { header: 'Serviço', weight: 1.1 },
  { header: 'Observação', weight: 2.4 },
];

function linhasManutencao(manutencoes: Maintenance[], pecas: Part[]): string[][] {
  return manutencoes.map((m) => {
    const peca = pecas.find((p) => p.id === m.partId);
    return [
      peca?.reference ?? `#${m.partId}`,
      peca?.description ?? 'Peça não encontrada',
      m.serviceType,
      m.observation || 'Sem observação',
    ];
  });
}

/**
 * Modelo (template) do documento "Ordem de Serviço" impresso em PDF: cabeçalho com
 * empresa/loja/técnico/status, uma seção por forno atendido (com suas manutenções) e
 * um bloco de assinaturas ao final. Consumido pela função `baixarPdf` da tela de
 * detalhe da ordem (`app/(home)/ordem-de-servico/[ordemId]/index.tsx`).
 */
export function buildWorkOrderPdfDocument(params: WorkOrderPdfTemplateParams): DocumentDefinitions {
  const { ordem, loja, tecnico, itens, pecas } = params;

  const infoBox = [
    
    { label: 'Loja', value: loja ? `${loja.description} — ${loja.address}` : 'Não encontrada' },
    ...(loja?.contactName || loja?.contactNumber
      ? [
          {
            label: 'Contato da loja',
            value: [loja?.contactName, loja?.contactNumber].filter(Boolean).join(' · '),
          },
        ]
      : []),
    { label: 'Técnico responsável', value: tecnico },
    { label: 'Data de abertura', value: formatarData(ordem.createdAt) },
    { label: 'Status', value: STATUS_LABELS[ordem.status] },
    { label: 'Prioridade', value: WORK_ORDER_PRIORITY_LABELS[ordem.priority] },
  ];

  const sections = itens.map(({ orderOven, oven, manutencoes }) => ({
    heading: linhaForno(oven),
    lines: [
      `Observação da ordem: ${orderOven.observation || 'Sem observação'}`,
      ...(manutencoes.length === 0 ? ['Nenhuma manutenção registrada para este forno.'] : []),
    ],
    table:
      manutencoes.length > 0
        ? { columns: MANUTENCAO_COLUMNS, rows: linhasManutencao(manutencoes, pecas) }
        : undefined,
  }));

  const footerLines = [
    '_________________________________',
    'Assinatura do Técnico',
    '',
    '_________________________________',
    'Assinatura do Responsável / Cliente',
    '',
    `Documento gerado em ${formatarDataHora(new Date())}`,
  ];

  return {
    title: `Ordem de Serviço #${ordem.id}`,
    subtitle: '',
    infoBox,
    sections,
    footerLines,
  };
}
