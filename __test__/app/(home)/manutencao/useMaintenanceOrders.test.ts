import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMaintenanceOrders } from '../../../../app/(home)/manutencao/useMaintenanceOrders';
import { useAuth } from '@/context/AuthContext';
import { workOrderUseCase, storeUseCase, maintenanceUseCase } from '../../../../infra/ioc/container';
import { WorkOrder } from '../../../../domain/entities/WorkOrder';
import { Store } from '../../../../domain/entities/Store';
import { Maintenance } from '../../../../domain/entities/Maintenance';

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
  maintenanceUseCase: { findAll: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findWithFilterMock = workOrderUseCase.findWithFilter as jest.Mock;
const findAllStoresMock = storeUseCase.findAll as jest.Mock;
const findAllMaintenancesMock = maintenanceUseCase.findAll as jest.Mock;

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

function buildMaintenance(overrides: Partial<Maintenance> = {}): Maintenance {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    orderId: 1,
    ovenId: 1,
    partId: 1,
    maintenanceDate: '2026-07-20T00:00:00.000Z',
    serviceType: 'Inspeção',
    observation: '',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findWithFilterMock.mockReset();
  findAllStoresMock.mockReset();
  findAllMaintenancesMock.mockReset();
});

describe('useMaintenanceOrders', () => {
  it('keeps only finalizada orders or orders with maintenance already registered', async () => {
    findWithFilterMock.mockResolvedValue([
      buildOrder({ id: 1, status: 'finalizada' }),
      buildOrder({ id: 2, status: 'pendente' }),
      buildOrder({ id: 3, status: 'pendente' }),
    ]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findAllMaintenancesMock.mockResolvedValue([buildMaintenance({ orderId: 2 })]);

    const { result } = renderHook(() => useMaintenanceOrders());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.ordens.map((o) => o.id)).toEqual([1, 2]);
    expect(result.current.lojasPorId).toEqual({ 1: buildStore() });
  });

  it('setLojaFiltro reloads scoped to the chosen store', async () => {
    findWithFilterMock.mockResolvedValue([]);
    findAllStoresMock.mockResolvedValue([]);
    findAllMaintenancesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useMaintenanceOrders());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
      result.current.setLojaFiltro(5);
    });

    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', 5);
  });
});
