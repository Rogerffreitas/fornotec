import { StoreInteractor } from '../storeInteractor';
import { StoreRepositoryGateway } from '../../application/gateway/StoreRepositoryGateway';
import { Store } from '../../entities/Store';

function makeGateway(
  overrides: Partial<StoreRepositoryGateway> = {},
): jest.Mocked<StoreRepositoryGateway> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    ...overrides,
  } as jest.Mocked<StoreRepositoryGateway>;
}

function buildStore(overrides: Partial<Store> = {}): Store {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    description: 'Loja Centro',
    address: 'Av. Principal, 100',
    ...overrides,
  };
}

describe('StoreInteractor.findWithFilter', () => {
  it('returns every store when the filter is blank', async () => {
    const stores = [buildStore()];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(stores) });
    const interactor = new StoreInteractor(gateway);

    const result = await interactor.findWithFilter('ent-1', '');

    expect(result).toEqual(stores);
  });

  it('filters case-insensitively by description', async () => {
    const stores = [
      buildStore({ id: 1, description: 'Loja Centro' }),
      buildStore({ id: 2, description: 'Loja Shopping Iguatemi' }),
    ];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(stores) });
    const interactor = new StoreInteractor(gateway);

    const result = await interactor.findWithFilter('ent-1', 'SHOPPING');

    expect(result).toEqual([stores[1]]);
  });
});

describe('StoreInteractor.create', () => {
  it('delegates directly to the gateway', async () => {
    const created = buildStore({ id: 5 });
    const gateway = makeGateway({ create: jest.fn().mockResolvedValue(created) });
    const interactor = new StoreInteractor(gateway);

    const data = { description: 'Loja Nova', address: 'Rua X, 1' };
    const result = await interactor.create('ent-1', data);

    expect(gateway.create).toHaveBeenCalledWith('ent-1', data);
    expect(result).toEqual(created);
  });
});

describe('StoreInteractor.update', () => {
  it('delegates to the gateway with the given id and data', async () => {
    const updated = buildStore({ description: 'Loja Renovada' });
    const gateway = makeGateway({ update: jest.fn().mockResolvedValue(updated) });
    const interactor = new StoreInteractor(gateway);

    const data = { description: 'Loja Renovada', address: 'Av. Principal, 100' };
    const result = await interactor.update('ent-1', 1, data);

    expect(gateway.update).toHaveBeenCalledWith('ent-1', 1, data);
    expect(result).toEqual(updated);
  });
});
