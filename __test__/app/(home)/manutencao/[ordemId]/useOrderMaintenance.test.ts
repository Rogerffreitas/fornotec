import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useOrderMaintenance } from '../../../../../app/(home)/manutencao/[ordemId]/useOrderMaintenance';
import { useAuth } from '@/context/AuthContext';
import {
  workOrderUseCase,
  storeUseCase,
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
  pdfGenerator,
} from '../../../../../infra/ioc/container';
import { WorkOrder, WorkOrderOven } from '../../../../../domain/entities/WorkOrder';
import { Oven } from '../../../../../domain/entities/Oven';
import { Maintenance } from '../../../../../domain/entities/Maintenance';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  workOrderUseCase: { findById: jest.fn(), findOvensOfOrder: jest.fn() },
  storeUseCase: { findById: jest.fn() },
  ovenUseCase: { findById: jest.fn(), findPartsOfOven: jest.fn() },
  partUseCase: { findByIds: jest.fn() },
  maintenanceUseCase: { findByOrder: jest.fn(), findAll: jest.fn(), remove: jest.fn() },
  pdfGenerator: { generate: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ ordemId: '42' }),
  Stack: { Screen: () => null },
}));
jest.mock('../../../../../infra/pdf/templates/maintenanceReportPdfTemplate', () => ({
  buildMaintenanceReportPdfDocument: jest.fn().mockReturnValue({}),
}));
jest.mock('../../../../../infra/pdf/baixarPdfNaWeb', () => ({ baixarPdfNaWeb: jest.fn() }));

const useAuthMock = useAuth as jest.Mock;
const findOrderByIdMock = workOrderUseCase.findById as jest.Mock;
const findOvensOfOrderMock = workOrderUseCase.findOvensOfOrder as jest.Mock;
const findStoreByIdMock = storeUseCase.findById as jest.Mock;
const findOvenByIdMock = ovenUseCase.findById as jest.Mock;
const findPartsOfOvenMock = ovenUseCase.findPartsOfOven as jest.Mock;
const findPartsByIdsMock = partUseCase.findByIds as jest.Mock;
const findByOrderMock = maintenanceUseCase.findByOrder as jest.Mock;
const findAllMaintenancesMock = maintenanceUseCase.findAll as jest.Mock;
const removeMock = maintenanceUseCase.remove as jest.Mock;
const generatePdfMock = pdfGenerator.generate as jest.Mock;

function buildOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: 42,
    enterpriseId: 'ent-1',
    storeId: 1,
    createdAt: '2026-07-20T00:00:00.000Z',
    status: 'finalizada',
    priority: 'media',
    ...overrides,
  };
}

function buildOrderOven(overrides: Partial<WorkOrderOven> = {}): WorkOrderOven {
  return { id: 1, enterpriseId: 'ent-1', orderId: 42, ovenId: 1, observation: '', ...overrides };
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

function buildMaintenance(overrides: Partial<Maintenance> = {}): Maintenance {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    orderId: 42,
    ovenId: 1,
    partId: 1,
    maintenanceDate: '2026-07-20T00:00:00.000Z',
    serviceType: 'Inspeção',
    observation: '',
    ...overrides,
  };
}

// Ambiente de teste não é web — cai no branch nativo de confirmarExclusao (Alert.alert com
// botões Cancelar/Excluir). Por padrão simula que o usuário toca em "Excluir" (buttons[1]).
let alertSpy: jest.SpyInstance;

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1', enterpriseName: 'Empresa' } });
  findOrderByIdMock.mockReset();
  findOvensOfOrderMock.mockReset();
  findStoreByIdMock.mockReset();
  findOvenByIdMock.mockReset();
  findPartsOfOvenMock.mockReset();
  findPartsByIdsMock.mockReset();
  findByOrderMock.mockReset();
  findAllMaintenancesMock.mockReset();
  removeMock.mockReset();
  generatePdfMock.mockReset();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
    buttons?.[1]?.onPress?.();
  });
});

afterEach(() => {
  alertSpy.mockRestore();
});

describe('useOrderMaintenance', () => {
  it('loads the order, its store, ovens and maintenance grouped by oven', async () => {
    findOrderByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue({ id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A' });
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());
    findByOrderMock.mockResolvedValue([buildMaintenance()]);
    findPartsByIdsMock.mockResolvedValue([]);

    const { result } = renderHook(() => useOrderMaintenance());

    await waitFor(() => expect(result.current.fornosDaOrdem).toEqual([buildOven()]));
    expect(result.current.manutencoesPorForno).toEqual({ 1: [buildMaintenance()] });
  });

  it('excluir asks for confirmation, removes the item and reloads', async () => {
    findOrderByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());
    findByOrderMock.mockResolvedValue([buildMaintenance()]);
    findPartsByIdsMock.mockResolvedValue([]);
    removeMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOrderMaintenance());
    await waitFor(() => expect(result.current.fornosDaOrdem).toEqual([buildOven()]));

    await act(async () => {
      await result.current.excluir(buildMaintenance());
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith('ent-1', 1);
  });

  it('excluir does nothing when the user cancels the confirmation', async () => {
    alertSpy.mockImplementation((_title, _msg, buttons) => {
      buttons?.[0]?.onPress?.();
    });
    findOrderByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([]);
    findByOrderMock.mockResolvedValue([]);
    findPartsByIdsMock.mockResolvedValue([]);

    const { result } = renderHook(() => useOrderMaintenance());
    await waitFor(() => expect(result.current.ordem).toEqual(buildOrder()));

    await act(async () => {
      await result.current.excluir(buildMaintenance());
    });

    expect(removeMock).not.toHaveBeenCalled();
  });

  it('baixarRelatorio builds the report from every oven of the order', async () => {
    findOrderByIdMock.mockResolvedValue(buildOrder());
    findStoreByIdMock.mockResolvedValue(null);
    findOvensOfOrderMock.mockResolvedValue([buildOrderOven()]);
    findOvenByIdMock.mockResolvedValue(buildOven());
    findByOrderMock.mockResolvedValue([]);
    findPartsByIdsMock.mockResolvedValue([]);
    findAllMaintenancesMock.mockResolvedValue([buildMaintenance()]);
    findPartsOfOvenMock.mockResolvedValue([]);
    generatePdfMock.mockResolvedValue(new Uint8Array());

    const { result } = renderHook(() => useOrderMaintenance());
    await waitFor(() => expect(result.current.fornosDaOrdem).toEqual([buildOven()]));

    await act(async () => {
      await result.current.baixarRelatorio();
    });

    expect(findAllMaintenancesMock).toHaveBeenCalledWith('ent-1');
    expect(generatePdfMock).toHaveBeenCalled();
  });
});
