import { UserRepositoryGatewayApi } from '../UserRepositoryGatewayApi';
import { HttpClient } from '../../../domain/application/infra/HttpClient';

function makeHttpClient(overrides: Partial<HttpClient> = {}): HttpClient {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as HttpClient;
}

describe('UserRepositoryGatewayApi.authenticate', () => {
  it('posts to /auth/signin and unwraps accessToken.token from the response', async () => {
    const http = makeHttpClient({
      post: jest.fn().mockResolvedValue({ accessToken: { token: 'jwt-token', type: 'Bearer' } }),
    });
    const gateway = new UserRepositoryGatewayApi(http);

    const result = await gateway.authenticate('rogerffreitas', 'exemplo', 'TECHNICAL');

    expect(http.post).toHaveBeenCalledWith('/auth/signin', {
      username: 'rogerffreitas',
      password: 'exemplo',
      role: 'TECHNICAL',
    });
    expect(result).toEqual({ token: 'jwt-token' });
  });

  it('propagates errors from the HttpClient (e.g. HttpError, network/CORS failures)', async () => {
    const failure = new Error('network down');
    const http = makeHttpClient({ post: jest.fn().mockRejectedValue(failure) });
    const gateway = new UserRepositoryGatewayApi(http);

    await expect(gateway.authenticate('rogerffreitas', 'exemplo', 'TECHNICAL')).rejects.toBe(
      failure,
    );
  });
});

describe('UserRepositoryGatewayApi.create', () => {
  it('posts the new user payload to /users', async () => {
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue({ id: 7 }) });
    const gateway = new UserRepositoryGatewayApi(http);

    const data = {
      name: 'Novo Usuário',
      username: 'novo',
      password: 'hashed',
      role: 'CLIENT' as const,
      enterpriseId: 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11',
    };

    const result = await gateway.create(data);

    expect(http.post).toHaveBeenCalledWith('/users', data);
    expect(result).toEqual({ id: 7 });
  });
});
