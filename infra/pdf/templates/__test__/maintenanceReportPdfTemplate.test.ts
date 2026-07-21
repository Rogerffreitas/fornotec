import { buildMaintenanceReportPdfDocument } from '../maintenanceReportPdfTemplate';
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

const oven: Oven = {
  id: 7,
  enterpriseId: 'e1',
  storeId: 1,
  assetNumber: 'PAT-01',
  description: 'Forno combinado',
  lastMaintenance: null,
  maintenanceFrequency: 90,
  nextMaintenance: null,
};

const pecaA: Part = {
  id: 1,
  enterpriseId: 'e1',
  description: 'Termostato',
  location: 'CC',
  reference: 'CC001',
};

const pecaB: Part = {
  id: 2,
  enterpriseId: 'e1',
  description: 'Resistência',
  location: 'CC',
  reference: 'CC002',
};

function maintenance(overrides: Partial<Maintenance>): Maintenance {
  return {
    id: 1,
    enterpriseId: 'e1',
    orderId: 10,
    ovenId: 7,
    partId: 1,
    maintenanceDate: '2026-01-01T00:00:00.000Z',
    serviceType: 'Inspeção',
    observation: '',
    ...overrides,
  };
}

describe('buildMaintenanceReportPdfDocument', () => {
  it('lista todas as peças do forno com a manutenção mais recente de cada uma', () => {
    const antiga = maintenance({ id: 1, orderId: 8, maintenanceDate: '2026-01-01T00:00:00.000Z', serviceType: 'Inspeção' });
    const recente = maintenance({ id: 2, orderId: 12, maintenanceDate: '2026-06-01T12:00:00.000Z', serviceType: 'Substituição', observation: 'Trocada' });

    const documento = buildMaintenanceReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      ordemId: 12,
      itens: [{ oven, pecas: [pecaA, pecaB], historico: [antiga, recente] }],
    });

    expect(documento.title).toBe('Relatório de Manutenção');
    expect(documento.infoBox).toEqual(
      expect.arrayContaining([
        { label: 'Loja', value: 'Loja Centro — Rua A, 123' },
        { label: 'Ordem de serviço', value: '#12' },
      ]),
    );

    expect(documento.sections).toHaveLength(1);
    const [section] = documento.sections;
    expect(section.heading).toContain('Forno combinado');
    expect(section.table?.rows).toEqual([
      ['CC001', 'Termostato', '01/06/2026', '12', 'Substituição', 'Trocada'],
      ['CC002', 'Resistência', '—', '—', '—', '—'],
    ]);
  });

  it('indica peça sem nenhuma manutenção registrada', () => {
    const documento = buildMaintenanceReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      ordemId: 1,
      itens: [{ oven, pecas: [pecaA], historico: [] }],
    });

    expect(documento.sections[0].table?.rows).toEqual([['CC001', 'Termostato', '—', '—', '—', '—']]);
  });

  it('indica forno sem nenhuma peça cadastrada', () => {
    const documento = buildMaintenanceReportPdfDocument({
      loja,
      enterpriseName: 'Empresa Teste',
      ordemId: 1,
      itens: [{ oven, pecas: [], historico: [] }],
    });

    expect(documento.sections[0].table).toBeUndefined();
    expect(documento.sections[0].lines).toContain('Nenhuma peça cadastrada neste forno.');
  });
});
