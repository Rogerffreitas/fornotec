import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWorkOrders } from '../../../../app/(home)/ordem-de-servico/useWorkOrders';
import { useAuth } from '@/context/AuthContext';
import { workOrderUseCase, storeUseCase } from '../../../../infra/ioc/container';
import { WorkOrder } from '../../../../domain/entities/WorkOrder';
import { Store } from '../../../../domain/entities/Store';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../infra/ioc/container', () => ({
  workOrderUseCase: { findWithFilter: jest.fn() },
  storeUseCase: { findAll: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findWithFilterMock = workOrderUseCase.findWithFilter as jest.Mock;
const findAllStoresMock = storeUseCase.findAll as jest.Mock;

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

function buildStore(overrides: Partial<Store> = {}): Store {
  return { id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A, 123', ...overrides };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findWithFilterMock.mockReset();
  findAllStoresMock.mockReset();
});

describe('useWorkOrders', () => {
  it('loads every order (no store filter) and indexes stores by id', async () => {
    findWithFilterMock.mockResolvedValue([buildOrder()]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    const { result } = renderHook(() => useWorkOrders());

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', undefined);
    expect(result.current.ordens).toEqual([buildOrder()]);
    expect(result.current.lojasPorId).toEqual({ 1: buildStore() });
  });

  it('setLojaFiltro reloads scoped to the chosen store', async () => {
    findWithFilterMock.mockResolvedValue([]);
    findAllStoresMock.mockResolvedValue([]);
    const { result } = renderHook(() => useWorkOrders());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
      result.current.setLojaFiltro(3);
    });

    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', 3);
  });
});
