import { PartRepositoryGatewayApi } from '../PartRepositoryGatewayApi';
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

describe('PartRepositoryGatewayApi.findAll', () => {
  it('gets /parts with the auth header', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new PartRepositoryGatewayApi(http);

    await gateway.findAll('ent-1');

    expect(http.get).toHaveBeenCalledWith('/parts', { headers: authHeader() });
  });
});

describe('PartRepositoryGatewayApi.findByIds', () => {
  it('returns an empty array without calling the HttpClient when ids is empty', async () => {
    const http = makeHttpClient();
    const gateway = new PartRepositoryGatewayApi(http);

    const result = await gateway.findByIds('ent-1', []);

    expect(result).toEqual([]);
    expect(http.post).not.toHaveBeenCalled();
  });

  it('posts the ids to /parts/search', async () => {
    const parts = [{ id: 1 }, { id: 2 }];
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue(parts) });
    const gateway = new PartRepositoryGatewayApi(http);

    const result = await gateway.findByIds('ent-1', [1, 2]);

    expect(http.post).toHaveBeenCalledWith(
      '/parts/search',
      { ids: [1, 2] },
      { headers: authHeader() },
    );
    expect(result).toBe(parts);
  });
});

describe('PartRepositoryGatewayApi.findById', () => {
  it('gets /parts/:id', async () => {
    const part = { id: 1 };
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue(part) });
    const gateway = new PartRepositoryGatewayApi(http);

    const result = await gateway.findById('ent-1', 1);

    expect(http.get).toHaveBeenCalledWith('/parts/1', { headers: authHeader() });
    expect(result).toBe(part);
  });

  it('returns undefined on a 404 HttpError', async () => {
    const http = makeHttpClient({
      get: jest.fn().mockRejectedValue(new HttpError(404, '/parts/99')),
    });
    const gateway = new PartRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 99)).resolves.toBeUndefined();
  });

  it('rethrows non-404 errors', async () => {
    const failure = new HttpError(500, '/parts/1');
    const http = makeHttpClient({ get: jest.fn().mockRejectedValue(failure) });
    const gateway = new PartRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 1)).rejects.toBe(failure);
  });
});

describe('PartRepositoryGatewayApi.create', () => {
  it('posts the new part payload to /parts', async () => {
    const created = { id: 5 };
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue(created) });
    const gateway = new PartRepositoryGatewayApi(http);

    const data = { description: 'Peça nova', location: 'CC' as const };
    const result = await gateway.create('ent-1', data);

    expect(http.post).toHaveBeenCalledWith('/parts', data, { headers: authHeader() });
    expect(result).toBe(created);
  });
});
