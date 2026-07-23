import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNewOven } from '../../../../../app/(home)/fornos/novo-forno/useNewOven';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase, ovenUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { Store } from '../../../../../domain/entities/Store';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  storeUseCase: { findAll: jest.fn() },
  ovenUseCase: { create: jest.fn() },
}));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const findAllMock = storeUseCase.findAll as jest.Mock;
const createMock = ovenUseCase.create as jest.Mock;
const backMock = router.back as jest.Mock;

function buildStore(overrides: Partial<Store> = {}): Store {
  return { id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A, 123', ...overrides };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findAllMock.mockReset();
  createMock.mockReset();
  backMock.mockReset();
});

describe('useNewOven', () => {
  it('loads stores and pre-selects the first one', async () => {
    findAllMock.mockResolvedValue([buildStore({ id: 1 }), buildStore({ id: 2 })]);
    const { result } = renderHook(() => useNewOven());

    await waitFor(() => expect(result.current.storeId).toBe(1));
    expect(result.current.lojas).toHaveLength(2);
  });

  it('rejects when required fields are missing', async () => {
    findAllMock.mockResolvedValue([]);
    const { result } = renderHook(() => useNewOven());

    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.erro).toMatch(/loja.*descrição/i);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('creates the oven with the selected store and navigates back', async () => {
    findAllMock.mockResolvedValue([buildStore({ id: 5 })]);
    createMock.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useNewOven());
    await waitFor(() => expect(result.current.storeId).toBe(5));

    act(() => {
      result.current.setDescription('Forno combinado');
    });
    await act(async () => {
      await result.current.salvar();
    });

    expect(createMock).toHaveBeenCalledWith(
      'ent-1',
      expect.objectContaining({ storeId: 5, description: 'Forno combinado', maintenanceFrequency: 90 }),
    );
    expect(backMock).toHaveBeenCalled();
  });
});
