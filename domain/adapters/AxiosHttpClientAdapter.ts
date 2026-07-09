import axios, { AxiosInstance, isAxiosError } from 'axios';
import { HttpClient, HttpRequestConfig, HttpError } from '../application/infra/HttpClient';

function toHttpError(error: unknown, url: string): unknown {
  if (isAxiosError(error) && error.response) {
    return new HttpError(error.response.status, url);
  }
  return error;
}

/** Implementação de HttpClient usando axios. Alternativa ao FetchHttpClientAdapter. */
export class AxiosHttpClientAdapter implements HttpClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string = '') {
    this.client = axios.create({ baseURL });
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    try {
      const { data } = await this.client.get<T>(url, {
        headers: config?.headers,
        params: config?.params,
      });
      return data;
    } catch (error) {
      throw toHttpError(error, url);
    }
  }

  async post<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    try {
      const { data } = await this.client.post<T>(url, body, {
        headers: config?.headers,
        params: config?.params,
      });
      return data;
    } catch (error) {
      throw toHttpError(error, url);
    }
  }

  async put<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    try {
      const { data } = await this.client.put<T>(url, body, {
        headers: config?.headers,
        params: config?.params,
      });
      return data;
    } catch (error) {
      throw toHttpError(error, url);
    }
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    try {
      const { data } = await this.client.delete<T>(url, {
        headers: config?.headers,
        params: config?.params,
      });
      return data;
    } catch (error) {
      throw toHttpError(error, url);
    }
  }
}
