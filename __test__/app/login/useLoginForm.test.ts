import { renderHook, act } from '@testing-library/react-native';
import { useLoginForm } from '../../../app/login/useLoginForm';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const replaceMock = router.replace as jest.Mock;

beforeEach(() => {
  replaceMock.mockReset();
});

describe('useLoginForm.handleEntrar', () => {
  it('maps the technician toggle to the TECHNICAL role and navigates home on success', async () => {
    const loginMock = jest.fn().mockResolvedValue(true);
    useAuthMock.mockReturnValue({ login: loginMock, loading: false, error: null });
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setUsername('tecnico');
      result.current.setPassword('senha123');
    });
    await act(async () => {
      await result.current.handleEntrar();
    });

    expect(loginMock).toHaveBeenCalledWith('tecnico', 'senha123', 'TECHNICAL');
    expect(replaceMock).toHaveBeenCalledWith('/');
  });

  it('maps the client toggle to the CLIENT role', async () => {
    const loginMock = jest.fn().mockResolvedValue(true);
    useAuthMock.mockReturnValue({ login: loginMock, loading: false, error: null });
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setRole('client');
    });
    await act(async () => {
      await result.current.handleEntrar();
    });

    expect(loginMock).toHaveBeenCalledWith('', '', 'CLIENT');
  });

  it('does not navigate when login fails', async () => {
    const loginMock = jest.fn().mockResolvedValue(false);
    useAuthMock.mockReturnValue({ login: loginMock, loading: false, error: 'Usuário ou senha inválidos' });
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleEntrar();
    });

    expect(replaceMock).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Usuário ou senha inválidos');
  });
});
