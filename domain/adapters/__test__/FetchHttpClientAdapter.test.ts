import { FetchHttpClientAdapter } from '../FetchHttpClientAdapter';
import { HttpError } from '../../application/infra/HttpClient';

function mockFetch(response: { ok: boolean; status: number; text: string }) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    text: jest.fn().mockResolvedValue(response.text),
  }) as unknown as typeof fetch;
}

describe('FetchHttpClientAdapter', () => {
  it('parses a JSON body', async () => {
    mockFetch({ ok: true, status: 200, text: JSON.stringify({ id: 1 }) });
    const adapter = new FetchHttpClientAdapter('http://api');

    const result = await adapter.get<{ id: number }>('/thing');

    expect(result).toEqual({ id: 1 });
  });

  it('returns undefined for an empty body instead of throwing (regression: DELETE with no content)', async () => {
    mockFetch({ ok: true, status: 200, text: '' });
    const adapter = new FetchHttpClientAdapter('http://api');

    await expect(adapter.delete('/thing/1')).resolves.toBeUndefined();
  });

  it('throws HttpError on a non-ok response', async () => {
    mockFetch({ ok: false, status: 404, text: '' });
    const adapter = new FetchHttpClientAdapter('http://api');

    await expect(adapter.get('/thing/99')).rejects.toEqual(new HttpError(404, '/thing/99'));
  });
});
