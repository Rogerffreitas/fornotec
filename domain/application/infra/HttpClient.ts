/**
 * Abstração sobre o cliente HTTP usado pelas implementações reais de
 * RepositoryGateway (quando o back-end existir). Hoje nenhum repositório usa
 * isto ainda — os repositórios são todos em memória. Ver domain/adapters.
 */
export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export interface HttpClient {
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T>;
  put<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}
