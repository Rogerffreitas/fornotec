import { renderHook, act } from '@testing-library/react-native';
import { useDashboard } from '../../../app/(home)/useDashboard';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';

jest.mock('../../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));

const useAuthMock = useAuth as jest.Mock;
const logoutMock = jest.fn();
const replaceMock = router.replace as jest.Mock;

beforeEach(() => {
  logoutMock.mockReset();
  replaceMock.mockReset();
});

describe('useDashboard', () => {
  it('shows every module for TECHNICAL', () => {
    useAuthMock.mockReturnValue({ user: { name: 'Roger', role: 'TECHNICAL' }, logout: logoutMock });
    const { result } = renderHook(() => useDashboard());

    expect(result.current.userName).toBe('Roger');
    expect(result.current.roleLabel).toBe('Perfil: técnico');
    expect(result.current.modulosVisiveis.map((m) => m.modulo)).toEqual([
      'lojas',
      'ordem-de-servico',
      'pecas',
      'fornos',
      'pecas-forno',
      'manutencao',
      'relatorios',
    ]);
  });

  it('restricts CLIENT to lojas/ordem-de-servico/fornos/relatorios', () => {
    useAuthMock.mockReturnValue({ user: { name: 'Maria', role: 'CLIENT' }, logout: logoutMock });
    const { result } = renderHook(() => useDashboard());

    expect(result.current.roleLabel).toBe('Perfil: cliente');
    expect(result.current.modulosVisiveis.map((m) => m.modulo)).toEqual([
      'lojas',
      'ordem-de-servico',
      'fornos',
      'relatorios',
    ]);
  });

  it('sair logs out and navigates to /login', () => {
    useAuthMock.mockReturnValue({ user: { name: 'Roger', role: 'TECHNICAL' }, logout: logoutMock });
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.sair());

    expect(logoutMock).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith('/login');
  });
});
