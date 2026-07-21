import { PartInteractor } from '../partInteractor';
import { PartRepositoryGateway } from '../../application/gateway/PartRepositoryGateway';
import { Part } from '../../entities/Part';

function makeGateway(
  overrides: Partial<PartRepositoryGateway> = {},
): jest.Mocked<PartRepositoryGateway> {
  return {
    findAll: jest.fn(),
    findByIds: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    ...overrides,
  } as jest.Mocked<PartRepositoryGateway>;
}

function buildPart(overrides: Partial<Part> = {}): Part {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    description: 'Resistência do vapor',
    location: 'GV',
    reference: 'GV001',
    ...overrides,
  };
}

describe('PartInteractor.findWithFilter', () => {
  it('returns every part when the filter is blank', async () => {
    const parts = [buildPart()];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(parts) });
    const interactor = new PartInteractor(gateway);

    const result = await interactor.findWithFilter('ent-1', '   ');

    expect(result).toEqual(parts);
  });

  it('filters case-insensitively by description', async () => {
    const parts = [
      buildPart({ id: 1, description: 'Resistência do vapor' }),
      buildPart({ id: 2, description: 'Controlador eletrônico', reference: 'PCU002' }),
    ];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(parts) });
    const interactor = new PartInteractor(gateway);

    const result = await interactor.findWithFilter('ent-1', 'RESISTÊNCIA');

    expect(result).toEqual([parts[0]]);
  });

  it('filters case-insensitively by reference', async () => {
    const parts = [
      buildPart({ id: 1, description: 'Resistência do vapor', reference: 'GV001' }),
      buildPart({ id: 2, description: 'Controlador eletrônico', reference: 'PCU002' }),
    ];
    const gateway = makeGateway({ findAll: jest.fn().mockResolvedValue(parts) });
    const interactor = new PartInteractor(gateway);

    const result = await interactor.findWithFilter('ent-1', 'pcu002');

    expect(result).toEqual([parts[1]]);
  });
});

describe('PartInteractor.findByIds', () => {
  it('delegates directly to the gateway', async () => {
    const parts = [buildPart({ id: 1 }), buildPart({ id: 2 })];
    const gateway = makeGateway({ findByIds: jest.fn().mockResolvedValue(parts) });
    const interactor = new PartInteractor(gateway);

    const result = await interactor.findByIds('ent-1', [1, 2]);

    expect(gateway.findByIds).toHaveBeenCalledWith('ent-1', [1, 2]);
    expect(result).toEqual(parts);
  });
});
