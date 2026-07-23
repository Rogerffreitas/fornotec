import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNewWorkOrder } from '../../../../../app/(home)/ordem-de-servico/nova-ordem/useNewWorkOrder';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase, ovenUseCase, workOrderUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { Store } from '../../../../../domain/entities/Store';
import { Oven } from '../../../../../domain/entities/Oven';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  storeUseCase: { findAll: jest.fn() },
  ovenUseCase: { findByStore: jest.fn() },
  workOrderUseCase: { create: jest.fn() },
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const findAllStoresMock = storeUseCase.findAll as jest.Mock;
const findByStoreMock = ovenUseCase.findByStore as jest.Mock;
const createOrderMock = workOrderUseCase.create as jest.Mock;
const replaceMock = router.replace as jest.Mock;

function buildStore(overrides: Partial<Store> = {}): Store {
  return { id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A, 123', ...overrides };
}

function buildOven(overrides: Partial<Oven> = {}): Oven {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    storeId: 1,
    assetNumber: 'PAT-01',
    description: 'Forno combinado',
    lastMaintenance: null,
    maintenanceFrequency: 90,
    nextMaintenance: null,
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findAllStoresMock.mockReset();
  findByStoreMock.mockReset();
  createOrderMock.mockReset();
  replaceMock.mockReset();
});

describe('useNewWorkOrder', () => {
  it('loads stores, pre-selects the first, and loads its ovens', async () => {
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findByStoreMock.mockResolvedValue([buildOven()]);
    const { result } = renderHook(() => useNewWorkOrder());

    await waitFor(() => expect(result.current.fornos).toEqual([buildOven()]));
    expect(result.current.storeId).toBe(1);
  });

  it('is invalid until a store and at least one oven (with observation) are chosen', async () => {
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findByStoreMock.mockResolvedValue([buildOven()]);
    const { result } = renderHook(() => useNewWorkOrder());
    await waitFor(() => expect(result.current.fornos).toEqual([buildOven()]));

    expect(result.current.valido).toBe(false);

    act(() => result.current.alternarForno(1));
    expect(result.current.valido).toBe(false);

    act(() => result.current.mudarObservacao(1, 'Barulho estranho'));
    expect(result.current.valido).toBe(true);
  });

  it('salvar creates the order and navigates to its detail screen', async () => {
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findByStoreMock.mockResolvedValue([buildOven()]);
    createOrderMock.mockResolvedValue({ order: { id: 42 }, orderOvens: [] });
    const { result } = renderHook(() => useNewWorkOrder());
    await waitFor(() => expect(result.current.fornos).toEqual([buildOven()]));

    act(() => result.current.alternarForno(1));
    act(() => result.current.mudarObservacao(1, 'Barulho estranho'));

    await act(async () => {
      await result.current.salvar();
    });

    expect(createOrderMock).toHaveBeenCalledWith(
      'ent-1',
      { storeId: 1, priority: 'media' },
      [{ ovenId: 1, observation: 'Barulho estranho' }],
    );
    expect(replaceMock).toHaveBeenCalledWith('/ordem-de-servico/42');
  });
});
