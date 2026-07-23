import { renderHook, act } from '@testing-library/react-native';
import { useNewStore } from '../../../../../app/(home)/lojas/nova-loja/useNewStore';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({ storeUseCase: { create: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const createMock = storeUseCase.create as jest.Mock;
const backMock = router.back as jest.Mock;

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  createMock.mockReset();
  backMock.mockReset();
});

describe('useNewStore.salvar', () => {
  it('rejects when description or address is missing, without calling the use-case', async () => {
    const { result } = renderHook(() => useNewStore());

    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.erro).toMatch(/obrigatórios/);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const { result } = renderHook(() => useNewStore());
    act(() => {
      result.current.setDescription('Loja Centro');
      result.current.setAddress('Rua A, 123');
      result.current.setEmail('invalido');
    });

    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.erro).toMatch(/e-mail válido/);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('creates the store, trimming fields and omitting empty optional ones', async () => {
    createMock.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useNewStore());
    act(() => {
      result.current.setDescription('  Loja Centro  ');
      result.current.setAddress('  Rua A, 123  ');
    });

    await act(async () => {
      await result.current.salvar();
    });

    expect(createMock).toHaveBeenCalledWith('ent-1', {
      description: 'Loja Centro',
      address: 'Rua A, 123',
      contactName: undefined,
      contactNumber: undefined,
      email: undefined,
    });
    expect(backMock).toHaveBeenCalled();
    expect(result.current.erro).toBeNull();
  });
});
