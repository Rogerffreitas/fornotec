import { Store } from '../../domain/entities/Store';
import { Part, generatePartReference } from '../../domain/entities/Part';
import { Oven } from '../../domain/entities/Oven';
import { OvenPart } from '../../domain/entities/OvenPart';
import { WorkOrder, WorkOrderOven } from '../../domain/entities/WorkOrder';
import { Maintenance } from '../../domain/entities/Maintenance';

/**
 * "Banco em memória": estado vive em módulos singleton enquanto o app está
 * aberto. Cada *RepositoryGatewayImpl* em ./*.ts lê/escreve nestes arrays.
 * Quando o back-end real existir, crie um ...RepositoryGatewayImpl usando
 * HttpClient (ver domain/adapters) e troque a instância no infra/ioc/container.ts.
 *
 * O login (User) já usa a API real — ver UserRepositoryGatewayApi — por isso
 * não há mais um array `users` aqui. Os demais recursos seguem em memória,
 * carimbados com o enterpriseId da empresa de teste retornada pelo back-end.
 */
export const DEMO_ENTERPRISE_ID = 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11';

export const stores: Store[] = [
  {
    id: 1,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Loja Centro',
    address: 'Av. Principal, 100 - Centro',
    contactName: 'Maria Souza',
    contactNumber: '(85) 99999-0001',
  },
  {
    id: 2,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Loja Shopping Iguatemi',
    address: 'Av. Washington Soares, 85 - Edson Queiroz',
    contactName: 'João Lima',
    contactNumber: '(85) 99999-0002',
  },
];

export const parts: Part[] = [
  {
    id: 1,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Resistência blindada',
    location: 'CC',
    reference: generatePartReference('CC', 1),
  },
  {
    id: 2,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Sensor de temperatura',
    location: 'PCU',
    reference: generatePartReference('PCU', 2),
  },
  {
    id: 3,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Botoeira liga/desliga',
    location: 'PCE',
    reference: generatePartReference('PCE', 3),
  },
  {
    id: 4,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Válvula solenoide',
    location: 'GV',
    reference: generatePartReference('GV', 4),
  },
  {
    id: 5,
    enterpriseId: DEMO_ENTERPRISE_ID,
    description: 'Dobradiça da porta',
    location: 'EE',
    reference: generatePartReference('EE', 5),
  },
];

export const ovens: Oven[] = [
  {
    id: 1,
    enterpriseId: DEMO_ENTERPRISE_ID,
    storeId: 1,
    assetNumber: 'PAT-0001',
    description: 'Forno combinado 10 GN',
    mark: 'Rational',
    voltage: '220V',
    power: '10000W',
    reference: 'FRC-10GN',
    lastMaintenance: '2026-04-10T00:00:00.000Z',
    maintenanceFrequency: 90,
    nextMaintenance: '2026-07-09T00:00:00.000Z',
  },
  {
    id: 2,
    enterpriseId: DEMO_ENTERPRISE_ID,
    storeId: 1,
    assetNumber: 'PAT-0002',
    description: 'Forno turbo elétrico',
    mark: 'Prática',
    voltage: '380V',
    power: '8000W',
    lastMaintenance: null,
    maintenanceFrequency: 60,
    nextMaintenance: null,
  },
  {
    id: 3,
    enterpriseId: DEMO_ENTERPRISE_ID,
    storeId: 2,
    assetNumber: 'PAT-0003',
    description: 'Forno combinado 6 GN',
    mark: 'Rational',
    voltage: '220V',
    power: '6000W',
    reference: 'FRC-06GN',
    lastMaintenance: '2026-05-01T00:00:00.000Z',
    maintenanceFrequency: 90,
    nextMaintenance: '2026-07-30T00:00:00.000Z',
  },
];

export const ovenParts: OvenPart[] = [
  { id: 1, enterpriseId: DEMO_ENTERPRISE_ID, ovenId: 1, partId: 1 },
  { id: 2, enterpriseId: DEMO_ENTERPRISE_ID, ovenId: 1, partId: 2 },
  { id: 3, enterpriseId: DEMO_ENTERPRISE_ID, ovenId: 3, partId: 1 },
];

export const workOrders: WorkOrder[] = [
  {
    id: 1,
    enterpriseId: DEMO_ENTERPRISE_ID,
    storeId: 1,
    createdAt: '2026-04-10T00:00:00.000Z',
    status: 'finalizada',
  },
];

export const workOrderOvens: WorkOrderOven[] = [
  {
    id: 1,
    enterpriseId: DEMO_ENTERPRISE_ID,
    orderId: 1,
    ovenId: 1,
    observation: 'Forno 1 está com problema no aquecimento',
  },
];

export const maintenances: Maintenance[] = [
  {
    id: 1,
    enterpriseId: DEMO_ENTERPRISE_ID,
    orderId: 1,
    ovenId: 1,
    partId: 1,
    maintenanceDate: '2026-04-10T00:00:00.000Z',
    serviceType: 'Substituição',
    observation: 'Resistência trocada, testada e aprovada',
  },
];
