import { OvenRepositoryGatewayApi } from '../OvenRepositoryGatewayApi';
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

describe('OvenRepositoryGatewayApi.findAll', () => {
  it('gets /ovens with the auth header', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new OvenRepositoryGatewayApi(http);

    await gateway.findAll('ent-1');

    expect(http.get).toHaveBeenCalledWith('/ovens', { headers: authHeader() });
  });
});

describe('OvenRepositoryGatewayApi.findByStore', () => {
  it('gets /ovens filtered by storeId', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new OvenRepositoryGatewayApi(http);

    await gateway.findByStore('ent-1', 2);

    expect(http.get).toHaveBeenCalledWith('/ovens', {
      headers: authHeader(),
      params: { storeId: 2 },
    });
  });
});

describe('OvenRepositoryGatewayApi.findById', () => {
  it('gets /ovens/:id', async () => {
    const oven = { id: 1 };
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue(oven) });
    const gateway = new OvenRepositoryGatewayApi(http);

    const result = await gateway.findById('ent-1', 1);

    expect(http.get).toHaveBeenCalledWith('/ovens/1', { headers: authHeader() });
    expect(result).toBe(oven);
  });

  it('returns undefined on a 404 HttpError', async () => {
    const http = makeHttpClient({
      get: jest.fn().mockRejectedValue(new HttpError(404, '/ovens/99')),
    });
    const gateway = new OvenRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 99)).resolves.toBeUndefined();
  });

  it('rethrows non-404 errors', async () => {
    const failure = new HttpError(500, '/ovens/1');
    const http = makeHttpClient({ get: jest.fn().mockRejectedValue(failure) });
    const gateway = new OvenRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 1)).rejects.toBe(failure);
  });
});

describe('OvenRepositoryGatewayApi.create', () => {
  it('posts the new oven payload to /ovens', async () => {
    const created = { id: 5 };
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue(created) });
    const gateway = new OvenRepositoryGatewayApi(http);

    const data = { storeId: 1, description: 'Forno novo', maintenanceFrequency: 30 };
    const result = await gateway.create('ent-1', data);

    expect(http.post).toHaveBeenCalledWith('/ovens', data, { headers: authHeader() });
    expect(result).toBe(created);
  });
});

describe('OvenRepositoryGatewayApi.update', () => {
  it('patches the edited fields to /ovens/:id', async () => {
    const updated = { id: 1, description: 'Forno renovado' };
    const http = makeHttpClient({ patch: jest.fn().mockResolvedValue(updated) });
    const gateway = new OvenRepositoryGatewayApi(http);

    const data = { description: 'Forno renovado', maintenanceFrequency: 60 };
    const result = await gateway.update('ent-1', 1, data);

    expect(http.patch).toHaveBeenCalledWith('/ovens/1', data, { headers: authHeader() });
    expect(result).toBe(updated);
  });
});

describe('OvenRepositoryGatewayApi.updateMaintenanceDates', () => {
  it('patches /ovens/:id/maintenance-dates', async () => {
    const updated = { id: 1 };
    const http = makeHttpClient({ patch: jest.fn().mockResolvedValue(updated) });
    const gateway = new OvenRepositoryGatewayApi(http);

    await gateway.updateMaintenanceDates(
      'ent-1',
      1,
      '2026-07-20T00:00:00.000Z',
      '2026-08-19T00:00:00.000Z',
    );

    expect(http.patch).toHaveBeenCalledWith(
      '/ovens/1/maintenance-dates',
      { lastMaintenance: '2026-07-20T00:00:00.000Z', nextMaintenance: '2026-08-19T00:00:00.000Z' },
      { headers: authHeader() },
    );
  });
});

describe('OvenRepositoryGatewayApi.findPartsByOven', () => {
  it('gets /ovens/:ovenId/parts', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new OvenRepositoryGatewayApi(http);

    await gateway.findPartsByOven('ent-1', 1);

    expect(http.get).toHaveBeenCalledWith('/ovens/1/parts', { headers: authHeader() });
  });
});

describe('OvenRepositoryGatewayApi.addParts', () => {
  it('posts partIds to /ovens/:ovenId/parts', async () => {
    const associations = [{ id: 1 }];
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue(associations) });
    const gateway = new OvenRepositoryGatewayApi(http);

    const result = await gateway.addParts('ent-1', 1, [5, 6]);

    expect(http.post).toHaveBeenCalledWith(
      '/ovens/1/parts',
      { partIds: [5, 6] },
      { headers: authHeader() },
    );
    expect(result).toBe(associations);
  });
});
