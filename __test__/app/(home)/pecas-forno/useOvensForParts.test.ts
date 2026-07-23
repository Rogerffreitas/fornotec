import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOvensForParts } from '../../../../app/(home)/pecas-forno/useOvensForParts';
import { useAuth } from '@/context/AuthContext';
import { ovenUseCase, storeUseCase } from '../../../../infra/ioc/container';
import { Oven } from '../../../../domain/entities/Oven';
import { Store } from '../../../../domain/entities/Store';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../infra/ioc/container', () => ({
  ovenUseCase: { findAll: jest.fn() },
  storeUseCase: { findAll: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findAllOvensMock = ovenUseCase.findAll as jest.Mock;
const findAllStoresMock = storeUseCase.findAll as jest.Mock;

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

function buildStore(overrides: Partial<Store> = {}): Store {
  return { id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A, 123', ...overrides };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findAllOvensMock.mockReset();
  findAllStoresMock.mockReset();
});

describe('useOvensForParts', () => {
  it('loads ovens and indexes stores by id', async () => {
    findAllOvensMock.mockResolvedValue([buildOven()]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    const { result } = renderHook(() => useOvensForParts());

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.fornosFiltrados).toEqual([buildOven()]);
    expect(result.current.lojasPorId).toEqual({ 1: buildStore() });
  });

  it('filters ovens by description locally, case-insensitively', async () => {
    findAllOvensMock.mockResolvedValue([
      buildOven({ id: 1, description: 'Forno combinado' }),
      buildOven({ id: 2, description: 'Forno de lastro' }),
    ]);
    findAllStoresMock.mockResolvedValue([buildStore()]);
    const { result } = renderHook(() => useOvensForParts());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => {
      result.current.setFiltro('LASTRO');
    });

    expect(result.current.fornosFiltrados).toEqual([
      buildOven({ id: 2, description: 'Forno de lastro' }),
    ]);
  });

  it('recarregar re-fetches ovens and stores', async () => {
    findAllOvensMock.mockResolvedValue([]);
    findAllStoresMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOvensForParts());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    findAllOvensMock.mockClear();
    await act(async () => {
      result.current.recarregar();
    });

    expect(findAllOvensMock).toHaveBeenCalledWith('ent-1');
  });
});
