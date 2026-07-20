/**
 * Abstração sobre o cliente HTTP usado pelas implementações reais de
 * RepositoryGateway. UserRepositoryGatewayApi já usa isto para chamar a API
 * real de login; os demais repositórios seguem em memória. Ver domain/adapters.
 */
export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export interface HttpClient {
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T>;
  put<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T>;
  patch<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}

/**
 * Lançado quando o servidor respondeu com um status HTTP de erro (ex: 401 de
 * credenciais inválidas). Distingue esse caso de uma falha de rede/CORS, onde
 * o `fetch`/`axios` nem chega a receber uma resposta do servidor.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    url: string,
  ) {
    super(`Erro HTTP ${status} ao chamar ${url}`);
    this.name = 'HttpError';
  }
}
