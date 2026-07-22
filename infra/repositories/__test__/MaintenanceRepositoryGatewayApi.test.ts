import { MaintenanceRepositoryGatewayApi } from '../MaintenanceRepositoryGatewayApi';
import { HttpClient } from '../../../domain/application/infra/HttpClient';
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

describe('MaintenanceRepositoryGatewayApi.findAll', () => {
  it('gets /maintenances with the auth header', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    await gateway.findAll('ent-1');

    expect(http.get).toHaveBeenCalledWith('/maintenances', { headers: authHeader() });
  });
});

describe('MaintenanceRepositoryGatewayApi.findByOrder', () => {
  it('gets /maintenances filtered by orderId only', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    await gateway.findByOrder('ent-1', 7);

    expect(http.get).toHaveBeenCalledWith('/maintenances', {
      headers: authHeader(),
      params: { orderId: 7 },
    });
  });
});

describe('MaintenanceRepositoryGatewayApi.findByOrderAndOven', () => {
  it('gets /maintenances filtered by orderId and ovenId', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    await gateway.findByOrderAndOven('ent-1', 7, 3);

    expect(http.get).toHaveBeenCalledWith('/maintenances', {
      headers: authHeader(),
      params: { orderId: 7, ovenId: 3 },
    });
  });
});

describe('MaintenanceRepositoryGatewayApi.findPage', () => {
  it('sends page/pageSize and omits storeId/ovenId when not given', async () => {
    const page = { items: [], total: 0 };
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue(page) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    const result = await gateway.findPage('ent-1', { page: 2, pageSize: 10 });

    expect(http.get).toHaveBeenCalledWith('/maintenances', {
      headers: authHeader(),
      params: { page: 2, pageSize: 10 },
    });
    expect(result).toEqual(page);
  });

  it('includes storeId and ovenId when given', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue({ items: [], total: 0 }) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    await gateway.findPage('ent-1', { storeId: 1, ovenId: 4, page: 1, pageSize: 10 });

    expect(http.get).toHaveBeenCalledWith('/maintenances', {
      headers: authHeader(),
      params: { page: 1, pageSize: 10, storeId: 1, ovenId: 4 },
    });
  });
});

describe('MaintenanceRepositoryGatewayApi.createMany', () => {
  it('returns an empty array without calling the HttpClient when data is empty', async () => {
    const http = makeHttpClient();
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    const result = await gateway.createMany('ent-1', []);

    expect(result).toEqual([]);
    expect(http.post).not.toHaveBeenCalled();
  });

  it('posts orderId/ovenId once (derived from the first item) plus one item per part', async () => {
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue([]) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    await gateway.createMany('ent-1', [
      { orderId: 7, ovenId: 3, partId: 1, serviceType: 'Substituição', observation: 'Trocado' },
      { orderId: 7, ovenId: 3, partId: 2, serviceType: 'Inspeção', observation: 'OK' },
    ]);

    expect(http.post).toHaveBeenCalledWith(
      '/maintenances',
      {
        orderId: 7,
        ovenId: 3,
        items: [
          { partId: 1, serviceType: 'Substituição', observation: 'Trocado' },
          { partId: 2, serviceType: 'Inspeção', observation: 'OK' },
        ],
      },
      { headers: authHeader() },
    );
  });
});

describe('MaintenanceRepositoryGatewayApi.remove', () => {
  it('deletes /maintenances/:id with the auth header', async () => {
    const http = makeHttpClient({ delete: jest.fn().mockResolvedValue(undefined) });
    const gateway = new MaintenanceRepositoryGatewayApi(http);

    await gateway.remove('ent-1', 5);

    expect(http.delete).toHaveBeenCalledWith('/maintenances/5', { headers: authHeader() });
  });
});
