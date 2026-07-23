import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOvens } from '../../../../app/(home)/fornos/useOvens';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase, ovenUseCase } from '../../../../infra/ioc/container';
import { Store } from '../../../../domain/entities/Store';
import { Oven } from '../../../../domain/entities/Oven';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    // Reexecuta sempre que o callback memoizado mudar (ex: quando alguma dependência do
    // useCallback interno muda) — não apenas uma vez no mount.
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../infra/ioc/container', () => ({
  storeUseCase: { findAll: jest.fn() },
  ovenUseCase: { findByStore: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findAllMock = storeUseCase.findAll as jest.Mock;
const findByStoreMock = ovenUseCase.findByStore as jest.Mock;

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
  findAllMock.mockReset();
  findByStoreMock.mockReset();
});

describe('useOvens', () => {
  it('loads stores, selects the first one and loads its ovens', async () => {
    findAllMock.mockResolvedValue([buildStore({ id: 1 }), buildStore({ id: 2 })]);
    findByStoreMock.mockResolvedValue([buildOven()]);
    const { result } = renderHook(() => useOvens());

    await waitFor(() => expect(result.current.storeId).toBe(1));
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(findByStoreMock).toHaveBeenCalledWith('ent-1', 1, '');
    expect(result.current.fornos).toEqual([buildOven()]);
  });

  it('setStoreId switches the selected store and reloads its ovens', async () => {
    findAllMock.mockResolvedValue([buildStore({ id: 1 }), buildStore({ id: 2 })]);
    findByStoreMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOvens());
    await waitFor(() => expect(result.current.storeId).toBe(1));

    findByStoreMock.mockResolvedValue([buildOven({ id: 9, storeId: 2 })]);
    await act(async () => {
      result.current.setStoreId(2);
    });

    expect(findByStoreMock).toHaveBeenCalledWith('ent-1', 2, '');
    expect(result.current.fornos).toEqual([buildOven({ id: 9, storeId: 2 })]);
  });

  it('handleFiltro reloads the current store with the new text', async () => {
    findAllMock.mockResolvedValue([buildStore({ id: 1 })]);
    findByStoreMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOvens());
    await waitFor(() => expect(result.current.storeId).toBe(1));

    await act(async () => {
      result.current.handleFiltro('combinado');
    });

    expect(result.current.filtro).toBe('combinado');
    expect(findByStoreMock).toHaveBeenCalledWith('ent-1', 1, 'combinado');
  });
});
