import { StoreRepositoryGatewayApi } from '../StoreRepositoryGatewayApi';
import { HttpClient, HttpError } from '../../../domain/application/infra/HttpClient';
import { authHeader } from '../../security/session';

function makeHttpClient(overrides: Partial<HttpClient> = {}): HttpClient {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as HttpClient;
}

describe('StoreRepositoryGatewayApi.findAll', () => {
  it('gets /stores with the auth header', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new StoreRepositoryGatewayApi(http);

    await gateway.findAll('ent-1');

    expect(http.get).toHaveBeenCalledWith('/stores', { headers: authHeader() });
  });
});

describe('StoreRepositoryGatewayApi.findById', () => {
  it('gets /stores/:id', async () => {
    const store = { id: 1 };
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue(store) });
    const gateway = new StoreRepositoryGatewayApi(http);

    const result = await gateway.findById('ent-1', 1);

    expect(http.get).toHaveBeenCalledWith('/stores/1', { headers: authHeader() });
    expect(result).toBe(store);
  });

  it('returns undefined on a 404 HttpError', async () => {
    const http = makeHttpClient({
      get: jest.fn().mockRejectedValue(new HttpError(404, '/stores/99')),
    });
    const gateway = new StoreRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 99)).resolves.toBeUndefined();
  });

  it('rethrows non-404 errors', async () => {
    const failure = new HttpError(500, '/stores/1');
    const http = makeHttpClient({ get: jest.fn().mockRejectedValue(failure) });
    const gateway = new StoreRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 1)).rejects.toBe(failure);
  });
});

describe('StoreRepositoryGatewayApi.create', () => {
  it('posts the new store payload to /stores', async () => {
    const created = { id: 5 };
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue(created) });
    const gateway = new StoreRepositoryGatewayApi(http);

    const data = { description: 'Loja Nova', address: 'Rua X, 1', email: 'loja@teste.com' };
    const result = await gateway.create('ent-1', data);

    expect(http.post).toHaveBeenCalledWith('/stores', data, { headers: authHeader() });
    expect(result).toBe(created);
  });
});
