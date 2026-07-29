import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useEditPart } from '../../../../../app/(home)/pecas/[pecaId]/useEditPart';
import { useAuth } from '@/context/AuthContext';
import { partUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { Part } from '../../../../../domain/entities/Part';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  partUseCase: { findById: jest.fn(), update: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ pecaId: '5' }),
  router: { back: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findByIdMock = partUseCase.findById as jest.Mock;
const updateMock = partUseCase.update as jest.Mock;
const backMock = router.back as jest.Mock;

function buildPart(overrides: Partial<Part> = {}): Part {
  return {
    id: 5,
    enterpriseId: 'ent-1',
    description: 'Resistência',
    location: 'CC',
    reference: 'CC005',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findByIdMock.mockReset();
  updateMock.mockReset();
  backMock.mockReset();
});

describe('useEditPart', () => {
  it('loads the part', async () => {
    findByIdMock.mockResolvedValue(buildPart());
    const { result } = renderHook(() => useEditPart());

    await waitFor(() => expect(result.current.carregado).toBe(true));

    expect(findByIdMock).toHaveBeenCalledWith('ent-1', 5);
    expect(result.current.naoEncontrado).toBe(false);
    expect(result.current.description).toBe('Resistência');
    expect(result.current.location).toBe('CC');
  });

  it('flags naoEncontrado when the part does not exist', async () => {
    findByIdMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEditPart());

    await waitFor(() => expect(result.current.carregado).toBe(true));

    expect(result.current.naoEncontrado).toBe(true);
  });

  it('salvar rejects when description or location is missing', async () => {
    findByIdMock.mockResolvedValue(buildPart());
    const { result } = renderHook(() => useEditPart());
    await waitFor(() => expect(result.current.carregado).toBe(true));

    act(() => {
      result.current.setDescription('');
    });
    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.erro).toMatch(/descrição.*localização/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('salvar updates the part and navigates back', async () => {
    findByIdMock.mockResolvedValue(buildPart());
    updateMock.mockResolvedValue(buildPart({ location: 'PCU', reference: 'PCU005' }));
    const { result } = renderHook(() => useEditPart());
    await waitFor(() => expect(result.current.carregado).toBe(true));

    act(() => {
      result.current.setDescription('Resistência blindada');
      result.current.setLocation('PCU');
    });
    await act(async () => {
      await result.current.salvar();
    });

    expect(updateMock).toHaveBeenCalledWith('ent-1', 5, {
      description: 'Resistência blindada',
      location: 'PCU',
    });
    expect(backMock).toHaveBeenCalled();
  });
});
