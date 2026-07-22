import { HttpClient, HttpRequestConfig, HttpError } from '../application/infra/HttpClient';

function withQuery(url: string, params?: HttpRequestConfig['params']): string {
  if (!params) return url;
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return query ? `${url}?${query}` : url;
}

/** Implementação de HttpClient usando a Fetch API nativa. Pronta para uso quando o back-end existir. */
export class FetchHttpClientAdapter implements HttpClient {
  constructor(private readonly baseURL: string = '') {}

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    config?: HttpRequestConfig,
  ): Promise<T> {
    const response = await fetch(withQuery(this.baseURL + url, config?.params), {
      method,
      headers: { 'Content-Type': 'application/json', ...(config?.headers ?? {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      throw new HttpError(response.status, url);
    }
    // DELETE (e outras respostas sem corpo) chegam com texto vazio — response.json() quebraria com
    // "Unexpected end of JSON input" nesse caso.
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  post<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>('POST', url, body, config);
  }

  put<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, body, config);
  }

  patch<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, body, config);
  }

  delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}
