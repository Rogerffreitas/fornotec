import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNewMaintenanceWizard } from '../../../../../app/(home)/manutencao/nova-manutencao/useNewMaintenanceWizard';
import { useAuth } from '@/context/AuthContext';
import {
  workOrderUseCase,
  ovenUseCase,
  storeUseCase,
  partUseCase,
  maintenanceUseCase,
} from '../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { WorkOrder, WorkOrderOven } from '../../../../../domain/entities/WorkOrder';
import { Store } from '../../../../../domain/entities/Store';
import { Oven } from '../../../../../domain/entities/Oven';
import { Part } from '../../../../../domain/entities/Part';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  workOrderUseCase: { findAll: jest.fn(), findOvensOfOrder: jest.fn() },
  ovenUseCase: { findById: jest.fn(), findPartsOfOven: jest.fn() },
  storeUseCase: { findAll: jest.fn() },
  partUseCase: { findByIds: jest.fn() },
  maintenanceUseCase: { register: jest.fn() },
}));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const findAllOrdersMock = workOrderUseCase.findAll as jest.Mock;
const findOvensOfOrderMock = workOrderUseCase.findOvensOfOrder as jest.Mock;
const findOvenByIdMock = ovenUseCase.findById as jest.Mock;
const findPartsOfOvenMock = ovenUseCase.findPartsOfOven as jest.Mock;
const findAllStoresMock = storeUseCase.findAll as jest.Mock;
const findPartsByIdsMock = partUseCase.findByIds as jest.Mock;
const registerMock = maintenanceUseCase.register as jest.Mock;
const backMock = router.back as jest.Mock;

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

function buildOrderOven(overrides: Partial<WorkOrderOven> = {}): WorkOrderOven {
  return { id: 1, enterpriseId: 'ent-1', orderId: 1, ovenId: 1, observation: '', ...overrides };
}

function buildPart(overrides: Partial<Part> = {}): Part {
  return { id: 1, enterpriseId: 'ent-1', description: 'Termostato', location: 'CC', reference: 'CC001', ...overrides };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findAllOrdersMock.mockReset();
  findOvensOfOrderMock.mockReset();
  findOvenByIdMock.mockReset();
  findPartsOfOvenMock.mockReset();
  findAllStoresMock.mockReset();
  findPartsByIdsMock.mockReset();
  registerMock.mockReset();
  backMock.mockReset();
});

describe('useNewMaintenanceWizard', () => {
  it('loads only pendente orders, indexed stores', async () => {
    findAllOrdersMock.mockResolvedValue([
      buildOrder({ id: 1, status: 'pendente' }),
      buildOrder({ id: 2, status: 'finalizada' }),
    ]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    const { result } = renderHook(() => useNewMaintenanceWizard());

    await waitFor(() => expect(result.current.ordens).toHaveLength(1));
    expect(result.current.ordens[0].id).toBe(1);
    expect(result.current.lojasPorId).toEqual({ 1: buildStore() });
  });

  it('cascades: choosing an order loads its ovens, choosing an oven loads its parts', async () => {
    findAllOrdersMock.mockResolvedValue([buildOrder()]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());
    findPartsOfOvenMock.mockResolvedValue([{ id: 1, enterpriseId: 'ent-1', ovenId: 1, partId: 1 }]);
    findPartsByIdsMock.mockResolvedValue([buildPart()]);

    const { result } = renderHook(() => useNewMaintenanceWizard());
    await waitFor(() => expect(result.current.ordens).toHaveLength(1));

    act(() => result.current.setOrderId(1));
    await waitFor(() => expect(result.current.fornosDaOrdem).toEqual([buildOven()]));

    act(() => result.current.setOvenId(1));
    await waitFor(() => expect(result.current.pecasDoForno).toEqual([buildPart()]));
  });

  it('salvar registers the maintenance item and navigates back', async () => {
    findAllOrdersMock.mockResolvedValue([buildOrder()]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());
    findPartsOfOvenMock.mockResolvedValue([{ id: 1, enterpriseId: 'ent-1', ovenId: 1, partId: 1 }]);
    findPartsByIdsMock.mockResolvedValue([buildPart()]);
    registerMock.mockResolvedValue([]);

    const { result } = renderHook(() => useNewMaintenanceWizard());
    await waitFor(() => expect(result.current.ordens).toHaveLength(1));
    act(() => result.current.setOrderId(1));
    await waitFor(() => expect(result.current.fornosDaOrdem).toEqual([buildOven()]));
    act(() => result.current.setOvenId(1));
    await waitFor(() => expect(result.current.pecasDoForno).toEqual([buildPart()]));
    act(() => result.current.setPartId(1));
    act(() => result.current.setServico('Inspeção'));

    await act(async () => {
      await result.current.salvar();
    });

    expect(registerMock).toHaveBeenCalledWith('ent-1', 1, 1, [
      { partId: 1, serviceType: 'Inspeção', observation: '' },
    ]);
    expect(backMock).toHaveBeenCalled();
  });
});
