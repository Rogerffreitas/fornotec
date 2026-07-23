import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWorkOrder } from '../../../../../app/(home)/ordem-de-servico/[ordemId]/useWorkOrder';
import { useAuth } from '@/context/AuthContext';
import {
  workOrderUseCase,
  ovenUseCase,
  storeUseCase,
  maintenanceUseCase,
  partUseCase,
  pdfGenerator,
} from '../../../../../infra/ioc/container';
import { WorkOrder, WorkOrderOven } from '../../../../../domain/entities/WorkOrder';
import { Oven } from '../../../../../domain/entities/Oven';
import { AssinaturaCliente } from '../../../../../domain/entities/Signature';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  workOrderUseCase: {
    findById: jest.fn(),
    findOvensOfOrder: jest.fn(),
    finalize: jest.fn(),
    cancel: jest.fn(),
  },
  ovenUseCase: { findById: jest.fn() },
  storeUseCase: { findById: jest.fn() },
  maintenanceUseCase: { findByOrder: jest.fn() },
  partUseCase: { findByIds: jest.fn() },
  pdfGenerator: { generate: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ ordemId: '42' }),
  Stack: { Screen: () => null },
  router: { push: jest.fn() },
}));
jest.mock('../../../../../infra/pdf/templates/workOrderPdfTemplate', () => ({
  buildWorkOrderPdfDocument: jest.fn().mockReturnValue({}),
}));
jest.mock('../../../../../infra/pdf/baixarPdfNaWeb', () => ({ baixarPdfNaWeb: jest.fn() }));

const useAuthMock = useAuth as jest.Mock;
const findByIdMock = workOrderUseCase.findById as jest.Mock;
const findOvensOfOrderMock = workOrderUseCase.findOvensOfOrder as jest.Mock;
const finalizeMock = workOrderUseCase.finalize as jest.Mock;
const cancelMock = workOrderUseCase.cancel as jest.Mock;
const findOvenByIdMock = ovenUseCase.findById as jest.Mock;
const findStoreByIdMock = storeUseCase.findById as jest.Mock;
const findMaintenanceByOrderMock = maintenanceUseCase.findByOrder as jest.Mock;
const findPartsByIdsMock = partUseCase.findByIds as jest.Mock;
const generatePdfMock = pdfGenerator.generate as jest.Mock;

function buildOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: 42,
    enterpriseId: 'ent-1',
    storeId: 1,
    createdAt: '2026-07-20T00:00:00.000Z',
    status: 'pendente',
    priority: 'media',
    ...overrides,
  };
}

function buildOrderOven(overrides: Partial<WorkOrderOven> = {}): WorkOrderOven {
  return { id: 1, enterpriseId: 'ent-1', orderId: 42, ovenId: 1, observation: 'Barulho', ...overrides };
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

const assinatura: AssinaturaCliente = { nome: 'Maria', tracos: [], largura: 100, altura: 50 };

beforeEach(() => {
  useAuthMock.mockReturnValue({
    user: { enterpriseId: 'ent-1', enterpriseName: 'Empresa', role: 'TECHNICAL' },
  });
  findByIdMock.mockReset();
  findOvensOfOrderMock.mockReset();
  finalizeMock.mockReset();
  cancelMock.mockReset();
  findOvenByIdMock.mockReset();
  findStoreByIdMock.mockReset();
  findMaintenanceByOrderMock.mockReset();
  findPartsByIdsMock.mockReset();
  generatePdfMock.mockReset();
});

describe('useWorkOrder', () => {
  it('loads the order, its store and its ovens', async () => {
    findByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue({ id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A' });
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());

    const { result } = renderHook(() => useWorkOrder());

    await waitFor(() => expect(result.current.ordem).toEqual(buildOrder()));
    expect(result.current.itens).toEqual([{ orderOven: buildOrderOven(), oven: buildOven() }]);
    expect(result.current.podeGerenciar).toBe(true);
  });

  it('podeGerenciar is false for CLIENT', async () => {
    useAuthMock.mockReturnValue({
      user: { enterpriseId: 'ent-1', enterpriseName: 'Empresa', role: 'CLIENT' },
    });
    findByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([]);

    const { result } = renderHook(() => useWorkOrder());
    await waitFor(() => expect(result.current.ordem).toEqual(buildOrder()));

    expect(result.current.podeGerenciar).toBe(false);
  });

  it('finalizar calls finalize, closes the modal and reloads', async () => {
    findByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([]);
    finalizeMock.mockResolvedValue(buildOrder({ status: 'finalizada' }));

    const { result } = renderHook(() => useWorkOrder());
    await waitFor(() => expect(result.current.ordem).toEqual(buildOrder()));

    act(() => result.current.abrirModalAssinatura());
    expect(result.current.modalAssinaturaVisivel).toBe(true);

    await act(async () => {
      await result.current.finalizar(assinatura);
    });

    expect(finalizeMock).toHaveBeenCalledWith('ent-1', 42, assinatura);
    expect(result.current.modalAssinaturaVisivel).toBe(false);
  });

  it('cancelar calls cancel and reloads', async () => {
    findByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([]);
    cancelMock.mockResolvedValue(buildOrder({ status: 'cancelada' }));

    const { result } = renderHook(() => useWorkOrder());
    await waitFor(() => expect(result.current.ordem).toEqual(buildOrder()));

    await act(async () => {
      await result.current.cancelar();
    });

    expect(cancelMock).toHaveBeenCalledWith('ent-1', 42);
  });

  it('baixarPdf gathers maintenance/parts and generates the PDF', async () => {
    findByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());
    findMaintenanceByOrderMock.mockResolvedValue([]);
    findPartsByIdsMock.mockResolvedValue([]);
    generatePdfMock.mockResolvedValue(new Uint8Array());

    const { result } = renderHook(() => useWorkOrder());
    await waitFor(() => expect(result.current.itens).toHaveLength(1));

    await act(async () => {
      await result.current.baixarPdf();
    });

    expect(findMaintenanceByOrderMock).toHaveBeenCalledWith('ent-1', 42);
    expect(generatePdfMock).toHaveBeenCalled();
  });
});
