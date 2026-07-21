import { WorkOrderInteractor } from '../workOrderInteractor';
import { WorkOrderRepositoryGateway } from '../../application/gateway/WorkOrderRepositoryGateway';
import { OvenUseCase } from '../../use-case/ovenUseCase';
import { WorkOrder, WorkOrderOven } from '../../entities/WorkOrder';
import { Oven } from '../../entities/Oven';

function makeGateway(
  overrides: Partial<WorkOrderRepositoryGateway> = {},
): jest.Mocked<WorkOrderRepositoryGateway> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    findOvensByOrder: jest.fn(),
    createOvens: jest.fn(),
    ...overrides,
  } as jest.Mocked<WorkOrderRepositoryGateway>;
}

function makeOvenUseCase(overrides: Partial<OvenUseCase> = {}): jest.Mocked<OvenUseCase> {
  return {
    findAll: jest.fn(),
    findByStore: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    registerCompletedMaintenance: jest.fn(),
    findPartsOfOven: jest.fn(),
    addPartsToOven: jest.fn(),
    ...overrides,
  } as jest.Mocked<OvenUseCase>;
}

function buildOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    storeId: 1,
    createdAt: '2026-07-20T00:00:00.000Z',
    status: 'pendente',
    priority: 'media',
    ...overrides,
  };
}

function buildOrderOven(overrides: Partial<WorkOrderOven> = {}): WorkOrderOven {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    orderId: 1,
    ovenId: 1,
    observation: 'Barulho estranho',
    ...overrides,
  };
}

describe('WorkOrderInteractor.findWithFilter', () => {
  it('returns every order when no storeId is given', async () => {
    const orders = [buildOrder({ id: 1, storeId: 1 }), buildOrder({ id: 2, storeId: 2 })];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(orders) });
    const interactor = new WorkOrderInteractor(gateway, makeOvenUseCase());

    const result = await interactor.findWithFilter('ent-1');

    expect(result).toEqual(orders);
  });

  it('filters orders by storeId', async () => {
    const orders = [buildOrder({ id: 1, storeId: 1 }), buildOrder({ id: 2, storeId: 2 })];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(orders) });
    const interactor = new WorkOrderInteractor(gateway, makeOvenUseCase());

    const result = await interactor.findWithFilter('ent-1', 2);

    expect(result).toEqual([buildOrder({ id: 2, storeId: 2 })]);
  });
});

describe('WorkOrderInteractor.create', () => {
  it('rejects when no ovens are selected, without calling the gateway', async () => {
    const gateway = makeGateway();
    const interactor = new WorkOrderInteractor(gateway, makeOvenUseCase());

    await expect(interactor.create('ent-1', { storeId: 1 }, [])).rejects.toThrow(
      /ao menos um forno/,
    );
    expect(gateway.create).not.toHaveBeenCalled();
  });

  it('creates the order then the ovens, using the created order id', async () => {
    const order = buildOrder({ id: 9 });
    const orderOvens = [buildOrderOven({ orderId: 9 })];
    const gateway = makeGateway({
      create: jest.fn().mockResolvedValue(order),
      createOvens: jest.fn().mockResolvedValue(orderOvens),
    });
    const interactor = new WorkOrderInteractor(gateway, makeOvenUseCase());

    const result = await interactor.create('ent-1', { storeId: 1, priority: 'alta' }, [
      { ovenId: 1, observation: 'Barulho estranho' },
    ]);

    expect(gateway.create).toHaveBeenCalledWith('ent-1', { storeId: 1, priority: 'alta' });
    expect(gateway.createOvens).toHaveBeenCalledWith('ent-1', [
      { orderId: 9, ovenId: 1, observation: 'Barulho estranho' },
    ]);
    expect(result).toEqual({ order, orderOvens });
  });
});

describe('WorkOrderInteractor.finalize', () => {
  it('marks the order as finalizada and propagates maintenance to every oven of the order', async () => {
    const order = buildOrder({
      id: 3,
      status: 'finalizada',
      createdAt: '2026-07-20T00:00:00.000Z',
    });
    const orderOvens = [buildOrderOven({ ovenId: 1 }), buildOrderOven({ ovenId: 2, id: 2 })];
    const gateway = makeGateway({
      updateStatus: jest.fn().mockResolvedValue(order),
      findOvensByOrder: jest.fn().mockResolvedValue(orderOvens),
    });
    const ovenUseCase = makeOvenUseCase({
      registerCompletedMaintenance: jest.fn().mockResolvedValue({} as Oven),
    });
    const interactor = new WorkOrderInteractor(gateway, ovenUseCase);

    const result = await interactor.finalize('ent-1', 3);

    expect(gateway.updateStatus).toHaveBeenCalledWith('ent-1', 3, 'finalizada');
    expect(ovenUseCase.registerCompletedMaintenance).toHaveBeenCalledWith(
      'ent-1',
      1,
      '2026-07-20T00:00:00.000Z',
    );
    expect(ovenUseCase.registerCompletedMaintenance).toHaveBeenCalledWith(
      'ent-1',
      2,
      '2026-07-20T00:00:00.000Z',
    );
    expect(ovenUseCase.registerCompletedMaintenance).toHaveBeenCalledTimes(2);
    expect(result).toEqual(order);
  });
});

describe('WorkOrderInteractor.cancel', () => {
  it('updates the order status to cancelada', async () => {
    const order = buildOrder({ id: 4, status: 'cancelada' });
    const gateway = makeGateway({ updateStatus: jest.fn().mockResolvedValue(order) });
    const interactor = new WorkOrderInteractor(gateway, makeOvenUseCase());

    const result = await interactor.cancel('ent-1', 4);

    expect(gateway.updateStatus).toHaveBeenCalledWith('ent-1', 4, 'cancelada');
    expect(result).toEqual(order);
  });
});
