import axios, { AxiosInstance } from "axios";
import { HttpClient, HttpRequestConfig } from "../application/infra/HttpClient";

/** Implementação de HttpClient usando axios. Alternativa ao FetchHttpClientAdapter. */
export class AxiosHttpClientAdapter implements HttpClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string = "") {
    this.client = axios.create({ baseURL });
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const { data } = await this.client.get<T>(url, { headers: config?.headers, params: config?.params });
    return data;
  }

  async post<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    const { data } = await this.client.post<T>(url, body, { headers: config?.headers, params: config?.params });
    return data;
  }

  async put<T>(url: string, body: unknown, config?: HttpRequestConfig): Promise<T> {
    const { data } = await this.client.put<T>(url, body, { headers: config?.headers, params: config?.params });
    return data;
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const { data } = await this.client.delete<T>(url, { headers: config?.headers, params: config?.params });
    return data;
  }
}
