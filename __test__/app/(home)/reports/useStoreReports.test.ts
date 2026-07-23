import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStoreReports } from '../../../../app/(home)/reports/useStoreReports';
import { useAuth } from '@/context/AuthContext';
import {
  storeUseCase,
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
  pdfGenerator,
} from '../../../../infra/ioc/container';
import {
  buildAnalyticStoreReportPdfDocument,
  buildSyntheticStoreReportPdfDocument,
} from '../../../../infra/pdf/templates/storeMaintenanceReportPdfTemplate';
import { Store } from '../../../../domain/entities/Store';
import { Oven } from '../../../../domain/entities/Oven';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../infra/ioc/container', () => ({
  storeUseCase: { findAll: jest.fn() },
  ovenUseCase: { findByStore: jest.fn(), findPartsOfOven: jest.fn() },
  partUseCase: { findByIds: jest.fn() },
  maintenanceUseCase: { findByStore: jest.fn() },
  pdfGenerator: { generate: jest.fn() },
}));
jest.mock('../../../../infra/pdf/templates/storeMaintenanceReportPdfTemplate', () => ({
  buildAnalyticStoreReportPdfDocument: jest.fn().mockReturnValue({}),
  buildSyntheticStoreReportPdfDocument: jest.fn().mockReturnValue({}),
}));
jest.mock('../../../../infra/pdf/baixarPdfNaWeb', () => ({ baixarPdfNaWeb: jest.fn() }));

const useAuthMock = useAuth as jest.Mock;
const findAllStoresMock = storeUseCase.findAll as jest.Mock;
const findByStoreOvensMock = ovenUseCase.findByStore as jest.Mock;
const findPartsOfOvenMock = ovenUseCase.findPartsOfOven as jest.Mock;
const findPartsByIdsMock = partUseCase.findByIds as jest.Mock;
const findByStoreMaintenanceMock = maintenanceUseCase.findByStore as jest.Mock;
const generatePdfMock = pdfGenerator.generate as jest.Mock;
const buildAnalyticMock = buildAnalyticStoreReportPdfDocument as jest.Mock;
const buildSyntheticMock = buildSyntheticStoreReportPdfDocument as jest.Mock;

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
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1', enterpriseName: 'Empresa' } });
  findAllStoresMock.mockReset();
  findByStoreOvensMock.mockReset();
  findPartsOfOvenMock.mockReset();
  findPartsByIdsMock.mockReset();
  findByStoreMaintenanceMock.mockReset();
  generatePdfMock.mockReset();
  buildAnalyticMock.mockClear();
  buildSyntheticMock.mockClear();
});

describe('useStoreReports', () => {
  it('loads every store on mount', async () => {
    findAllStoresMock.mockResolvedValue([buildStore()]);
    const { result } = renderHook(() => useStoreReports());

    await waitFor(() => expect(result.current.lojas).toEqual([buildStore()]));
  });

  it('gerar builds the synthetic report using the store-scoped oven/maintenance data', async () => {
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findByStoreOvensMock.mockResolvedValue([buildOven()]);
    findByStoreMaintenanceMock.mockResolvedValue([]);
    findPartsOfOvenMock.mockResolvedValue([]);
    generatePdfMock.mockResolvedValue(new Uint8Array());

    const { result } = renderHook(() => useStoreReports());
    await waitFor(() => expect(result.current.lojas).toEqual([buildStore()]));

    act(() => result.current.setLojaId(1));
    await act(async () => {
      await result.current.gerar('sintetico');
    });

    expect(findByStoreOvensMock).toHaveBeenCalledWith('ent-1', 1);
    expect(findByStoreMaintenanceMock).toHaveBeenCalledWith('ent-1', 1);
    expect(buildSyntheticMock).toHaveBeenCalled();
    expect(buildAnalyticMock).not.toHaveBeenCalled();
    expect(generatePdfMock).toHaveBeenCalled();
  });

  it('gerar builds the analytic report when requested', async () => {
    findAllStoresMock.mockResolvedValue([buildStore()]);
    findByStoreOvensMock.mockResolvedValue([]);
    findByStoreMaintenanceMock.mockResolvedValue([]);
    generatePdfMock.mockResolvedValue(new Uint8Array());

    const { result } = renderHook(() => useStoreReports());
    await waitFor(() => expect(result.current.lojas).toEqual([buildStore()]));

    act(() => result.current.setLojaId(1));
    await act(async () => {
      await result.current.gerar('analitico');
    });

    expect(buildAnalyticMock).toHaveBeenCalled();
    expect(buildSyntheticMock).not.toHaveBeenCalled();
  });

  it('gerar does nothing when no store is selected', async () => {
    findAllStoresMock.mockResolvedValue([]);
    const { result } = renderHook(() => useStoreReports());
    await waitFor(() => expect(result.current.lojas).toEqual([]));

    await act(async () => {
      await result.current.gerar('sintetico');
    });

    expect(generatePdfMock).not.toHaveBeenCalled();
  });
});
