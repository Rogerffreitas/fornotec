import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStores } from '../../../../app/(home)/lojas/useStores';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase } from '../../../../infra/ioc/container';
import { Store } from '../../../../domain/entities/Store';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    // Reexecuta sempre que o callback memoizado mudar (ex: quando alguma dependência do
    // useCallback interno muda) — não apenas uma vez no mount.
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../infra/ioc/container', () => ({ storeUseCase: { findWithFilter: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const findWithFilterMock = storeUseCase.findWithFilter as jest.Mock;

function buildStore(overrides: Partial<Store> = {}): Store {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    description: 'Loja Centro',
    address: 'Rua A, 123',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findWithFilterMock.mockReset();
});

describe('useStores', () => {
  it('loads every store (empty filter) on mount', async () => {
    findWithFilterMock.mockResolvedValue([buildStore()]);
    const { result } = renderHook(() => useStores());

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', '');
    expect(result.current.lojas).toEqual([buildStore()]);
  });

  it('handleFiltro updates filtro and reloads with the new text', async () => {
    findWithFilterMock.mockResolvedValue([]);
    const { result } = renderHook(() => useStores());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    findWithFilterMock.mockResolvedValue([buildStore({ description: 'Filtrada' })]);
    await act(async () => {
      result.current.handleFiltro('Filt');
    });

    expect(result.current.filtro).toBe('Filt');
    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', 'Filt');
    expect(result.current.lojas).toEqual([buildStore({ description: 'Filtrada' })]);
  });

  it('recarregar re-fetches using the current filtro', async () => {
    findWithFilterMock.mockResolvedValue([]);
    const { result } = renderHook(() => useStores());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
      result.current.handleFiltro('abc');
    });
    findWithFilterMock.mockClear();

    await act(async () => {
      result.current.recarregar();
    });

    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', 'abc');
  });
});
