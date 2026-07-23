import { renderHook, act } from '@testing-library/react-native';
import { useNewPart } from '../../../../../app/(home)/pecas/nova-peca/useNewPart';
import { useAuth } from '@/context/AuthContext';
import { partUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({ partUseCase: { create: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const createMock = partUseCase.create as jest.Mock;
const backMock = router.back as jest.Mock;

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  createMock.mockReset();
  backMock.mockReset();
});

describe('useNewPart.salvar', () => {
  it('rejects when description or location is missing', async () => {
    const { result } = renderHook(() => useNewPart());

    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.erro).toMatch(/descrição.*localização/i);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('creates the part and navigates back', async () => {
    createMock.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useNewPart());

    act(() => {
      result.current.setDescription('Resistência blindada');
      result.current.setLocation('CC');
    });
    await act(async () => {
      await result.current.salvar();
    });

    expect(createMock).toHaveBeenCalledWith('ent-1', {
      description: 'Resistência blindada',
      location: 'CC',
    });
    expect(backMock).toHaveBeenCalled();
  });
});
