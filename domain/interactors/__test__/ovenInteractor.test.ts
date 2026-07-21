import { OvenInteractor } from '../ovenInteractor';
import { OvenRepositoryGateway } from '../../application/gateway/OvenRepositoryGateway';
import { Oven } from '../../entities/Oven';
import { OvenPart } from '../../entities/OvenPart';

function makeGateway(
  overrides: Partial<OvenRepositoryGateway> = {},
): jest.Mocked<OvenRepositoryGateway> {
  return {
    findAll: jest.fn(),
    findByStore: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMaintenanceDates: jest.fn(),
    findPartsByOven: jest.fn(),
    addParts: jest.fn(),
    ...overrides,
  } as jest.Mocked<OvenRepositoryGateway>;
}

function buildOven(overrides: Partial<Oven> = {}): Oven {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    storeId: 1,
    assetNumber: 'forno1.1',
    description: 'Forno de lastro elétrico',
    lastMaintenance: null,
    maintenanceFrequency: 30,
    nextMaintenance: null,
    ...overrides,
  };
}

describe('OvenInteractor.findByStore', () => {
  it('returns every oven of the store when no filter text is given', async () => {
    const ovens = [buildOven()];
    const gateway = makeGateway({ findByStore: jest.fn().mockResolvedValue(ovens) });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.findByStore('ent-1', 1);

    expect(gateway.findByStore).toHaveBeenCalledWith('ent-1', 1);
    expect(result).toEqual(ovens);
  });

  it('returns every oven when the filter is blank/whitespace', async () => {
    const ovens = [buildOven()];
    const gateway = makeGateway({ findByStore: jest.fn().mockResolvedValue(ovens) });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.findByStore('ent-1', 1, '   ');

    expect(result).toEqual(ovens);
  });

  it('filters case-insensitively by description', async () => {
    const ovens = [
      buildOven({ id: 1, description: 'Forno de lastro elétrico' }),
      buildOven({ id: 2, description: 'Forno combinado' }),
    ];
    const gateway = makeGateway({ findByStore: jest.fn().mockResolvedValue(ovens) });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.findByStore('ent-1', 1, 'LASTRO');

    expect(result).toEqual([ovens[0]]);
  });

  it('filters case-insensitively by assetNumber', async () => {
    const ovens = [
      buildOven({ id: 1, assetNumber: 'forno1.1' }),
      buildOven({ id: 2, assetNumber: 'forno2.2' }),
    ];
    const gateway = makeGateway({ findByStore: jest.fn().mockResolvedValue(ovens) });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.findByStore('ent-1', 1, 'FORNO2');

    expect(result).toEqual([ovens[1]]);
  });

  it('does not crash when an oven has no assetNumber', async () => {
    const ovens = [buildOven({ id: 1, assetNumber: undefined, description: 'Sem patrimônio' })];
    const gateway = makeGateway({ findByStore: jest.fn().mockResolvedValue(ovens) });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.findByStore('ent-1', 1, 'patrimonio');

    expect(result).toEqual([]);
  });
});

describe('OvenInteractor.update', () => {
  it('delegates to the gateway with the given id and data', async () => {
    const updated = buildOven({ description: 'Forno renovado', maintenanceFrequency: 60 });
    const gateway = makeGateway({ update: jest.fn().mockResolvedValue(updated) });
    const interactor = new OvenInteractor(gateway);

    const data = { description: 'Forno renovado', maintenanceFrequency: 60 };
    const result = await interactor.update('ent-1', 1, data);

    expect(gateway.update).toHaveBeenCalledWith('ent-1', 1, data);
    expect(result).toEqual(updated);
  });
});

describe('OvenInteractor.registerCompletedMaintenance', () => {
  it('throws when the oven does not exist', async () => {
    const gateway = makeGateway({ findById: jest.fn().mockResolvedValue(undefined) });
    const interactor = new OvenInteractor(gateway);

    await expect(
      interactor.registerCompletedMaintenance('ent-1', 99, '2026-07-20T00:00:00.000Z'),
    ).rejects.toThrow(/99/);
    expect(gateway.updateMaintenanceDates).not.toHaveBeenCalled();
  });

  it('sets last maintenance to the order date and next = last + frequency days', async () => {
    const oven = buildOven({ id: 1, maintenanceFrequency: 30 });
    const updated = buildOven({
      id: 1,
      lastMaintenance: '2026-07-20T00:00:00.000Z',
      nextMaintenance: '2026-08-19T00:00:00.000Z',
    });
    const gateway = makeGateway({
      findById: jest.fn().mockResolvedValue(oven),
      updateMaintenanceDates: jest.fn().mockResolvedValue(updated),
    });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.registerCompletedMaintenance(
      'ent-1',
      1,
      '2026-07-20T00:00:00.000Z',
    );

    expect(gateway.updateMaintenanceDates).toHaveBeenCalledWith(
      'ent-1',
      1,
      '2026-07-20T00:00:00.000Z',
      '2026-08-19T00:00:00.000Z',
    );
    expect(result).toEqual(updated);
  });
});

describe('OvenInteractor.addPartsToOven', () => {
  it('short-circuits without calling the gateway when partIds is empty', async () => {
    const gateway = makeGateway();
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.addPartsToOven('ent-1', 1, []);

    expect(result).toEqual([]);
    expect(gateway.addParts).not.toHaveBeenCalled();
  });

  it('delegates to the gateway when there is at least one partId', async () => {
    const associations: OvenPart[] = [{ id: 1, enterpriseId: 'ent-1', ovenId: 1, partId: 5 }];
    const gateway = makeGateway({ addParts: jest.fn().mockResolvedValue(associations) });
    const interactor = new OvenInteractor(gateway);

    const result = await interactor.addPartsToOven('ent-1', 1, [5]);

    expect(gateway.addParts).toHaveBeenCalledWith('ent-1', 1, [5]);
    expect(result).toEqual(associations);
  });
});
