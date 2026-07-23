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

afterEach(() => {
  jest.useRealTimers();
});

describe('useDashboard', () => {
  it('shows every module for TECHNICAL, with a "sucesso" role badge', () => {
    useAuthMock.mockReturnValue({ user: { name: 'Roger', role: 'TECHNICAL' }, logout: logoutMock });
    const { result } = renderHook(() => useDashboard());

    expect(result.current.userName).toBe('Roger');
    expect(result.current.roleBadge).toEqual({ texto: 'Técnico', tom: 'sucesso' });
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

  it('restricts CLIENT to lojas/ordem-de-servico/fornos/relatorios, with a "neutro" role badge', () => {
    useAuthMock.mockReturnValue({ user: { name: 'Maria', role: 'CLIENT' }, logout: logoutMock });
    const { result } = renderHook(() => useDashboard());

    expect(result.current.roleBadge).toEqual({ texto: 'Cliente', tom: 'neutro' });
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

  it.each([
    [8, 'Bom dia'],
    [14, 'Boa tarde'],
    [20, 'Boa noite'],
  ])('at %i h greets with "%s"', (hora, esperado) => {
    useAuthMock.mockReturnValue({ user: { name: 'Roger', role: 'TECHNICAL' }, logout: logoutMock });
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 1, hora, 0, 0));

    const { result } = renderHook(() => useDashboard());

    expect(result.current.saudacao).toBe(esperado);
  });
});
