import {
  buildAnalyticStoreReportPdfDocument,
  buildSyntheticStoreReportPdfDocument,
} from '../storeMaintenanceReportPdfTemplate';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';
import { Part } from '../../../../domain/entities/Part';
import { Maintenance } from '../../../../domain/entities/Maintenance';

const loja: Store = {
  id: 1,
  enterpriseId: 'e1',
  description: 'Loja Centro',
  address: 'Rua A, 123',
};

function buildOven(overrides: Partial<Oven> = {}): Oven {
  return {
    id: 7,
    enterpriseId: 'e1',
    storeId: 1,
    assetNumber: 'PAT-01',
    description: 'Forno combinado',
    lastMaintenance: null,
    maintenanceFrequency: 90,
    nextMaintenance: null,
    ...overrides,
  };
}

const pecaA: Part = { id: 1, enterpriseId: 'e1', description: 'Termostato', location: 'CC', reference: 'CC001' };
const pecaB: Part = { id: 2, enterpriseId: 'e1', description: 'Resistência', location: 'CC', reference: 'CC002' };

function maintenance(overrides: Partial<Maintenance>): Maintenance {
  return {
    id: 1,
    enterpriseId: 'e1',
    orderId: 10,
    ovenId: 7,
    partId: 1,
    maintenanceDate: '2026-01-01T12:00:00.000Z',
    serviceType: 'Inspeção',
    observation: '',
    ...overrides,
  };
}

describe('buildSyntheticStoreReportPdfDocument', () => {
  it('não inclui a ordem de serviço no infoBox (relatório é por loja, não por OS)', () => {
    const documento = buildSyntheticStoreReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      itens: [{ oven: buildOven(), pecas: [], historico: [] }],
    });

    expect(documento.title).toBe('Relatório de Manutenção — Sintético');
    expect(documento.infoBox).toEqual([
      { label: 'Loja', value: 'Loja Centro' },
      { label: 'Endereço', value: 'Rua A, 123' },
      { label: 'Data de emissão', value: expect.any(String) },
    ]);
  });

  it('gera uma section por forno, com a manutenção mais recente de cada peça', () => {
    const antiga = maintenance({ id: 1, orderId: 8, maintenanceDate: '2026-01-01T12:00:00.000Z' });
    const recente = maintenance({
      id: 2,
      orderId: 12,
      maintenanceDate: '2026-06-01T12:00:00.000Z',
      serviceType: 'Substituição',
      observation: 'Trocada',
    });

    const documento = buildSyntheticStoreReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      itens: [{ oven: buildOven(), pecas: [pecaA, pecaB], historico: [antiga, recente] }],
    });

    expect(documento.sections).toHaveLength(1);
    expect(documento.sections[0].table?.rows).toEqual([
      ['CC001', 'Termostato', '01/06/2026', '12', 'Substituição', 'Trocada'],
      ['CC002', 'Resistência', '—', '—', '—', '—'],
    ]);
  });

  it('marca pageBreakBefore em todos os fornos exceto o primeiro', () => {
    const documento = buildSyntheticStoreReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      itens: [
        { oven: buildOven({ id: 1 }), pecas: [], historico: [] },
        { oven: buildOven({ id: 2 }), pecas: [], historico: [] },
        { oven: buildOven({ id: 3 }), pecas: [], historico: [] },
      ],
    });

    expect(documento.sections.map((s) => s.pageBreakBefore)).toEqual([false, true, true]);
  });
});

describe('buildAnalyticStoreReportPdfDocument', () => {
  it('lista as peças como subitens, cada uma com todo o histórico de manutenção (não só a mais recente)', () => {
    const antiga = maintenance({ id: 1, orderId: 8, maintenanceDate: '2026-01-01T12:00:00.000Z', serviceType: 'Inspeção' });
    const recente = maintenance({
      id: 2,
      orderId: 12,
      maintenanceDate: '2026-06-01T12:00:00.000Z',
      serviceType: 'Substituição',
      observation: 'Trocada',
    });

    const documento = buildAnalyticStoreReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      itens: [{ oven: buildOven(), pecas: [pecaA], historico: [antiga, recente] }],
    });

    expect(documento.title).toBe('Relatório de Manutenção — Analítico');
    expect(documento.sections).toHaveLength(1);
    expect(documento.sections[0].subsections).toHaveLength(1);
    expect(documento.sections[0].subsections?.[0].heading).toBe('CC001 — Termostato');
    // Mais recente primeiro.
    expect(documento.sections[0].subsections?.[0].table?.rows).toEqual([
      ['01/06/2026', '12', 'Substituição', 'Trocada'],
      ['01/01/2026', '8', 'Inspeção', 'Sem observação'],
    ]);
  });

  it('indica peça sem nenhuma manutenção registrada', () => {
    const documento = buildAnalyticStoreReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      itens: [{ oven: buildOven(), pecas: [pecaA], historico: [] }],
    });

    expect(documento.sections[0].subsections?.[0].table).toBeUndefined();
    expect(documento.sections[0].subsections?.[0].lines).toEqual([
      'Nenhuma manutenção registrada nesta peça.',
    ]);
  });

  it('separa o histórico por peça quando o forno tem mais de uma', () => {
    const paraA = maintenance({ id: 1, partId: 1, serviceType: 'Inspeção' });
    const paraB = maintenance({ id: 2, partId: 2, serviceType: 'Substituição' });

    const documento = buildAnalyticStoreReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      itens: [{ oven: buildOven(), pecas: [pecaA, pecaB], historico: [paraA, paraB] }],
    });

    const [subA, subB] = documento.sections[0].subsections ?? [];
    expect(subA.table?.rows).toEqual([[expect.any(String), '10', 'Inspeção', 'Sem observação']]);
    expect(subB.table?.rows).toEqual([[expect.any(String), '10', 'Substituição', 'Sem observação']]);
  });
});
