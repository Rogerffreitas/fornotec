import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { userUseCase } from '../../infra/ioc/container';
import { AuthenticatedUser } from '../../domain/entities/User';
import { getAuthToken } from '../../infra/security/session';

jest.mock('../../infra/ioc/container', () => ({
  userUseCase: { authenticate: jest.fn(), register: jest.fn() },
}));

const authenticateMock = userUseCase.authenticate as jest.Mock;

const AUTHENTICATED_USER: AuthenticatedUser = {
  id: 'f621024a-a938-4d4e-9517-cf33d9ea6034',
  name: 'Roger Freitas',
  username: 'rogerffreitas',
  email: 'rogerf@outlook.com',
  role: 'TECHNICAL',
  enterpriseId: 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11',
  enterpriseName: 'CALDAS E FURLANI ENG.',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  authenticateMock.mockReset();
});

describe('AuthContext login', () => {
  it('stores the user and propagates the token to the session module on successful authentication', async () => {
    authenticateMock.mockResolvedValue({ user: AUTHENTICATED_USER, token: 'jwt-token' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    let ok: boolean = false;
    await act(async () => {
      ok = await result.current.login('rogerffreitas', 'exemplo', 'TECHNICAL');
    });

    expect(ok).toBe(true);
    expect(authenticateMock).toHaveBeenCalledWith('rogerffreitas', 'exemplo', 'TECHNICAL');
    expect(result.current.user).toEqual(AUTHENTICATED_USER);
    expect(getAuthToken()).toBe('jwt-token');
    expect(result.current.error).toBeNull();
  });

  it('sets an "invalid credentials" error when authenticate resolves undefined', async () => {
    authenticateMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    let ok: boolean = true;
    await act(async () => {
      ok = await result.current.login('rogerffreitas', 'wrong', 'TECHNICAL');
    });

    expect(ok).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Usuário, senha ou perfil inválidos.');
  });

  it('sets a distinct connection error when authenticate rejects (network/CORS)', async () => {
    authenticateMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useAuth(), { wrapper });

    let ok: boolean = true;
    await act(async () => {
      ok = await result.current.login('rogerffreitas', 'exemplo', 'TECHNICAL');
    });

    expect(ok).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    );
  });

  it('sets loading while the request is in flight', async () => {
    let resolveAuthenticate: (value: { user: AuthenticatedUser; token: string }) => void;
    authenticateMock.mockReturnValue(
      new Promise((resolve) => {
        resolveAuthenticate = resolve;
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login('rogerffreitas', 'exemplo', 'TECHNICAL');
    });
    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolveAuthenticate({ user: AUTHENTICATED_USER, token: 'jwt-token' });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe('AuthContext logout', () => {
  it('clears the user and the session token', async () => {
    authenticateMock.mockResolvedValue({ user: AUTHENTICATED_USER, token: 'jwt-token' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('rogerffreitas', 'exemplo', 'TECHNICAL');
    });
    expect(result.current.user).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(getAuthToken()).toBeNull();
  });
});
