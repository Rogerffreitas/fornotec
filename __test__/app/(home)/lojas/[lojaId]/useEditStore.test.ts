import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useEditStore } from '../../../../../app/(home)/lojas/[lojaId]/useEditStore';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { Store } from '../../../../../domain/entities/Store';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  storeUseCase: { findById: jest.fn(), update: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ lojaId: '7' }),
  router: { back: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findByIdMock = storeUseCase.findById as jest.Mock;
const updateMock = storeUseCase.update as jest.Mock;
const backMock = router.back as jest.Mock;

function buildStore(overrides: Partial<Store> = {}): Store {
  return {
    id: 7,
    enterpriseId: 'ent-1',
    description: 'Loja Centro',
    address: 'Rua A, 123',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findByIdMock.mockReset();
  updateMock.mockReset();
  backMock.mockReset();
});

describe('useEditStore', () => {
  it('loads the store fields by id from the route param', async () => {
    findByIdMock.mockResolvedValue(buildStore({ contactName: 'Maria' }));
    const { result } = renderHook(() => useEditStore());

    await waitFor(() => expect(result.current.carregado).toBe(true));

    expect(findByIdMock).toHaveBeenCalledWith('ent-1', 7);
    expect(result.current.naoEncontrada).toBe(false);
    expect(result.current.description).toBe('Loja Centro');
    expect(result.current.contactName).toBe('Maria');
  });

  it('flags naoEncontrada when the store does not exist', async () => {
    findByIdMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEditStore());

    await waitFor(() => expect(result.current.carregado).toBe(true));

    expect(result.current.naoEncontrada).toBe(true);
  });

  it('salvar updates the store and navigates back', async () => {
    findByIdMock.mockResolvedValue(buildStore());
    updateMock.mockResolvedValue(buildStore());
    const { result } = renderHook(() => useEditStore());
    await waitFor(() => expect(result.current.carregado).toBe(true));

    act(() => {
      result.current.setDescription('Loja Nova');
    });
    await act(async () => {
      await result.current.salvar();
    });

    expect(updateMock).toHaveBeenCalledWith(
      'ent-1',
      7,
      expect.objectContaining({ description: 'Loja Nova' }),
    );
    expect(backMock).toHaveBeenCalled();
  });
});
