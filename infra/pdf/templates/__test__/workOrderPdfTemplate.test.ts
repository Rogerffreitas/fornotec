import { buildWorkOrderPdfDocument } from '../workOrderPdfTemplate';
import { WorkOrder, WorkOrderOven } from '../../../../domain/entities/WorkOrder';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';
import { Maintenance } from '../../../../domain/entities/Maintenance';
import { Part } from '../../../../domain/entities/Part';

const ordem: WorkOrder = {
  id: 42,
  enterpriseId: 'e1',
  storeId: 1,
  createdAt: '2026-01-10T00:00:00.000Z',
  status: 'pendente',
  priority: 'alta',
};

const loja: Store = {
  id: 1,
  enterpriseId: 'e1',
  description: 'Loja Centro',
  address: 'Rua A, 123',
  contactName: 'Maria',
  contactNumber: '11999990000',
};

const oven: Oven = {
  id: 7,
  enterpriseId: 'e1',
  storeId: 1,
  assetNumber: 'PAT-01',
  description: 'Forno combinado',
  mark: 'MarcaX',
  voltage: '220V',
  power: '1000W',
  lastMaintenance: null,
  maintenanceFrequency: 90,
  nextMaintenance: null,
};

const orderOven: WorkOrderOven = {
  id: 1,
  enterpriseId: 'e1',
  orderId: 42,
  ovenId: 7,
  observation: 'Barulho estranho',
};

const peca: Part = {
  id: 5,
  enterpriseId: 'e1',
  description: 'Termostato',
  location: 'CC',
  reference: 'CC005',
};

const manutencao: Maintenance = {
  id: 1,
  enterpriseId: 'e1',
  orderId: 42,
  ovenId: 7,
  partId: 5,
  maintenanceDate: '2026-01-10T00:00:00.000Z',
  serviceType: 'Substituição',
  observation: 'Peça trocada',
};

describe('buildWorkOrderPdfDocument', () => {
  it('monta cabeçalho, seção do forno e assinaturas', () => {
    const documento = buildWorkOrderPdfDocument({
      ordem,
      loja,
      enterpriseName: 'Forno Tec Demo',
      tecnico: 'João Técnico',
      pecas: [peca],
      itens: [{ orderOven, oven, manutencoes: [manutencao] }],
    });

    expect(documento.title).toBe('Ordem de Serviço #42');
    expect(documento.infoBox).toEqual(
      expect.arrayContaining([
        { label: 'Loja', value: 'Loja Centro — Rua A, 123' },
        { label: 'Técnico responsável', value: 'João Técnico' },
        { label: 'Status', value: 'Pendente' },
        { label: 'Prioridade', value: 'Alta' },
      ]),
    );

    expect(documento.sections).toHaveLength(1);
    expect(documento.sections[0].heading).toContain('Forno combinado');
    expect(documento.sections[0].lines).toEqual(['Observação da ordem: Barulho estranho']);
    expect(documento.sections[0].table).toEqual({
      columns: expect.arrayContaining([{ header: 'Referência', weight: 1.1 }]),
      rows: [['CC005', 'Termostato', 'Substituição', 'Peça trocada']],
    });

    expect(documento.footerLines?.join('\n')).toContain('Assinatura do Técnico');
  });

  it('indica quando o forno não tem manutenções registradas', () => {
    const documento = buildWorkOrderPdfDocument({
      ordem,
      loja,
      enterpriseName: 'Forno Tec Demo',
      tecnico: 'João Técnico',
      pecas: [],
      itens: [{ orderOven, oven, manutencoes: [] }],
    });

    expect(documento.sections[0].lines).toContain(
      'Nenhuma manutenção registrada para este forno.',
    );
    expect(documento.sections[0].table).toBeUndefined();
  });

  it('lida com loja não encontrada', () => {
    const documento = buildWorkOrderPdfDocument({
      ordem,
      loja: null,
      enterpriseName: 'Forno Tec Demo',
      tecnico: 'João Técnico',
      pecas: [],
      itens: [],
    });

    expect(documento.infoBox).toEqual(
      expect.arrayContaining([{ label: 'Loja', value: 'Não encontrada' }]),
    );
  });
});
