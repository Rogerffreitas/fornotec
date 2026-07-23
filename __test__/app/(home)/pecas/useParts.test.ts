import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useParts } from '../../../../app/(home)/pecas/useParts';
import { useAuth } from '@/context/AuthContext';
import { partUseCase } from '../../../../infra/ioc/container';
import { Part } from '../../../../domain/entities/Part';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    // Reexecuta sempre que o callback memoizado mudar (ex: quando alguma dependência do
    // useCallback interno muda) — não apenas uma vez no mount.
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../infra/ioc/container', () => ({ partUseCase: { findWithFilter: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const findWithFilterMock = partUseCase.findWithFilter as jest.Mock;

function buildPart(overrides: Partial<Part> = {}): Part {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    description: 'Termostato',
    location: 'CC',
    reference: 'CC001',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findWithFilterMock.mockReset();
});

describe('useParts', () => {
  it('loads every part (empty filter) on mount', async () => {
    findWithFilterMock.mockResolvedValue([buildPart()]);
    const { result } = renderHook(() => useParts());

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', '');
    expect(result.current.pecas).toEqual([buildPart()]);
  });

  it('handleFiltro updates filtro and reloads with the new text', async () => {
    findWithFilterMock.mockResolvedValue([]);
    const { result } = renderHook(() => useParts());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    findWithFilterMock.mockResolvedValue([buildPart({ description: 'Filtrada' })]);
    await act(async () => {
      result.current.handleFiltro('Filt');
    });

    expect(result.current.filtro).toBe('Filt');
    expect(findWithFilterMock).toHaveBeenCalledWith('ent-1', 'Filt');
    expect(result.current.pecas).toEqual([buildPart({ description: 'Filtrada' })]);
  });

  it('recarregar re-fetches using the current filtro', async () => {
    findWithFilterMock.mockResolvedValue([]);
    const { result } = renderHook(() => useParts());
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
