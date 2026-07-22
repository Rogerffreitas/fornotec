import { WorkOrderRepositoryGatewayApi } from '../WorkOrderRepositoryGatewayApi';
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

describe('WorkOrderRepositoryGatewayApi.findAll', () => {
  it('gets /work-orders with the auth header', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await gateway.findAll('ent-1');

    expect(http.get).toHaveBeenCalledWith('/work-orders', { headers: authHeader() });
  });
});

describe('WorkOrderRepositoryGatewayApi.findById', () => {
  it('gets /work-orders/:id', async () => {
    const order = { id: 3 };
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue(order) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    const result = await gateway.findById('ent-1', 3);

    expect(http.get).toHaveBeenCalledWith('/work-orders/3', { headers: authHeader() });
    expect(result).toEqual(order);
  });

  it('parses clientSignatureData (JSON) into strokes + canvas size', async () => {
    const order = {
      id: 3,
      clientSignatureName: 'Maria Cliente',
      clientSignatureData: JSON.stringify({ tracos: [[{ x: 1, y: 2 }]], largura: 300, altura: 150 }),
    };
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue(order) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    const result = await gateway.findById('ent-1', 3);

    expect(result).toEqual({
      id: 3,
      clientSignatureName: 'Maria Cliente',
      clientSignatureStrokes: [[{ x: 1, y: 2 }]],
      clientSignatureCanvasWidth: 300,
      clientSignatureCanvasHeight: 150,
    });
  });

  it('returns undefined on a 404 HttpError', async () => {
    const http = makeHttpClient({
      get: jest.fn().mockRejectedValue(new HttpError(404, '/work-orders/99')),
    });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 99)).resolves.toBeUndefined();
  });

  it('rethrows non-404 errors', async () => {
    const failure = new HttpError(500, '/work-orders/1');
    const http = makeHttpClient({ get: jest.fn().mockRejectedValue(failure) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await expect(gateway.findById('ent-1', 1)).rejects.toBe(failure);
  });
});

describe('WorkOrderRepositoryGatewayApi.create', () => {
  it('posts the new order payload to /work-orders', async () => {
    const created = { id: 5 };
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue(created) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    const data = { storeId: 1, priority: 'alta' as const };
    const result = await gateway.create('ent-1', data);

    expect(http.post).toHaveBeenCalledWith('/work-orders', data, { headers: authHeader() });
    expect(result).toEqual(created);
  });
});

describe('WorkOrderRepositoryGatewayApi.updateStatus', () => {
  it('patches /work-orders/:id/status', async () => {
    const updated = { id: 1, status: 'cancelada' };
    const http = makeHttpClient({ patch: jest.fn().mockResolvedValue(updated) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await gateway.updateStatus('ent-1', 1, 'cancelada');

    expect(http.patch).toHaveBeenCalledWith(
      '/work-orders/1/status',
      { status: 'cancelada' },
      { headers: authHeader() },
    );
  });

  it('sends the client signature (serialized) when finalizing', async () => {
    const updated = { id: 1, status: 'finalizada' };
    const http = makeHttpClient({ patch: jest.fn().mockResolvedValue(updated) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await gateway.updateStatus('ent-1', 1, 'finalizada', {
      nome: 'Maria Cliente',
      tracos: [[{ x: 1, y: 2 }]],
      largura: 300,
      altura: 150,
    });

    expect(http.patch).toHaveBeenCalledWith(
      '/work-orders/1/status',
      {
        status: 'finalizada',
        clientSignatureName: 'Maria Cliente',
        clientSignatureData: JSON.stringify({ tracos: [[{ x: 1, y: 2 }]], largura: 300, altura: 150 }),
      },
      { headers: authHeader() },
    );
  });
});

describe('WorkOrderRepositoryGatewayApi.findOvensByOrder', () => {
  it('gets /work-orders/:id/ovens', async () => {
    const http = makeHttpClient({ get: jest.fn().mockResolvedValue([]) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await gateway.findOvensByOrder('ent-1', 3);

    expect(http.get).toHaveBeenCalledWith('/work-orders/3/ovens', { headers: authHeader() });
  });
});

describe('WorkOrderRepositoryGatewayApi.createOvens', () => {
  it('returns an empty array without calling the HttpClient when data is empty', async () => {
    const http = makeHttpClient();
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    const result = await gateway.createOvens('ent-1', []);

    expect(result).toEqual([]);
    expect(http.post).not.toHaveBeenCalled();
  });

  it('posts to /work-orders/:orderId/ovens using the orderId from the first item', async () => {
    const http = makeHttpClient({ post: jest.fn().mockResolvedValue([]) });
    const gateway = new WorkOrderRepositoryGatewayApi(http);

    await gateway.createOvens('ent-1', [
      { orderId: 9, ovenId: 1, observation: 'Barulho estranho' },
      { orderId: 9, ovenId: 2, observation: 'Não esquenta' },
    ]);

    expect(http.post).toHaveBeenCalledWith(
      '/work-orders/9/ovens',
      {
        ovens: [
          { ovenId: 1, observation: 'Barulho estranho' },
          { ovenId: 2, observation: 'Não esquenta' },
        ],
      },
      { headers: authHeader() },
    );
  });
});
