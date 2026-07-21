import { MaintenanceInteractor } from '../maintenanceInteractor';
import { MaintenanceRepositoryGateway } from '../../application/gateway/MaintenanceRepositoryGateway';
import { Maintenance } from '../../entities/Maintenance';

function makeGateway(
  overrides: Partial<MaintenanceRepositoryGateway> = {},
): jest.Mocked<MaintenanceRepositoryGateway> {
  return {
    findAll: jest.fn(),
    findByOrder: jest.fn(),
    findByOrderAndOven: jest.fn(),
    findPage: jest.fn(),
    createMany: jest.fn(),
    ...overrides,
  } as jest.Mocked<MaintenanceRepositoryGateway>;
}

function buildMaintenance(overrides: Partial<Maintenance> = {}): Maintenance {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    orderId: 1,
    ovenId: 1,
    partId: 1,
    maintenanceDate: '2026-07-20T00:00:00.000Z',
    serviceType: 'Substituição',
    observation: 'Trocado',
    ...overrides,
  };
}

describe('MaintenanceInteractor read methods', () => {
  it('findAll delegates to the gateway', async () => {
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue([buildMaintenance()]) });
    const interactor = new MaintenanceInteractor(gateway);

    const result = await interactor.findAll('ent-1');

    expect(gateway.findAll).toHaveBeenCalledWith('ent-1');
    expect(result).toEqual([buildMaintenance()]);
  });

  it('findByOrder delegates to the gateway with the orderId', async () => {
    const gateway = makeGateway({ findByOrder: jest.fn().mockResolvedValue([buildMaintenance()]) });
    const interactor = new MaintenanceInteractor(gateway);

    await interactor.findByOrder('ent-1', 5);

    expect(gateway.findByOrder).toHaveBeenCalledWith('ent-1', 5);
  });

  it('findByOrderAndOven delegates to the gateway with both ids', async () => {
    const gateway = makeGateway({
      findByOrderAndOven: jest.fn().mockResolvedValue([buildMaintenance()]),
    });
    const interactor = new MaintenanceInteractor(gateway);

    await interactor.findByOrderAndOven('ent-1', 5, 9);

    expect(gateway.findByOrderAndOven).toHaveBeenCalledWith('ent-1', 5, 9);
  });

  it('findPage delegates to the gateway with the filters object', async () => {
    const page = { items: [buildMaintenance()], total: 1 };
    const gateway = makeGateway({ findPage: jest.fn().mockResolvedValue(page) });
    const interactor = new MaintenanceInteractor(gateway);

    const filters = { storeId: 2, page: 1, pageSize: 10 };
    const result = await interactor.findPage('ent-1', filters);

    expect(gateway.findPage).toHaveBeenCalledWith('ent-1', filters);
    expect(result).toEqual(page);
  });
});

describe('MaintenanceInteractor.register', () => {
  it('creates one CreateMaintenanceInput per item, sharing orderId/ovenId', async () => {
    const gateway = makeGateway({ createMany: jest.fn().mockResolvedValue([buildMaintenance()]) });
    const interactor = new MaintenanceInteractor(gateway);

    await interactor.register('ent-1', 7, 3, [
      { partId: 1, serviceType: 'Substituição', observation: 'Trocado' },
      { partId: 2, serviceType: 'Inspeção', observation: 'OK' },
    ]);

    expect(gateway.createMany).toHaveBeenCalledWith('ent-1', [
      { orderId: 7, ovenId: 3, partId: 1, serviceType: 'Substituição', observation: 'Trocado' },
      { orderId: 7, ovenId: 3, partId: 2, serviceType: 'Inspeção', observation: 'OK' },
    ]);
  });

  it('returns whatever the gateway creates', async () => {
    const created = [buildMaintenance({ id: 42 })];
    const gateway = makeGateway({ createMany: jest.fn().mockResolvedValue(created) });
    const interactor = new MaintenanceInteractor(gateway);

    const result = await interactor.register('ent-1', 7, 3, [
      { partId: 1, serviceType: 'Substituição', observation: '' },
    ]);

    expect(result).toEqual(created);
  });
});
