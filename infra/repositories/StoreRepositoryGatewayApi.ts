import { StoreRepositoryGateway } from '../../domain/application/gateway/StoreRepositoryGateway';
import { Store, NewStore, StoreUpdate } from '../../domain/entities/Store';
import { HttpClient, HttpError } from '../../domain/application/infra/HttpClient';
import { authHeader } from '../security/session';

export class StoreRepositoryGatewayApi implements StoreRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async findAll(_enterpriseId: string): Promise<Store[]> {
    return this.http.get<Store[]>('/stores', { headers: authHeader() });
  }

  async findById(_enterpriseId: string, id: number): Promise<Store | undefined> {
    try {
      return await this.http.get<Store>(`/stores/${id}`, { headers: authHeader() });
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return undefined;
      throw error;
    }
  }

  async create(_enterpriseId: string, data: NewStore): Promise<Store> {
    return this.http.post<Store>('/stores', data, { headers: authHeader() });
  }

  async update(_enterpriseId: string, id: number, data: StoreUpdate): Promise<Store> {
    return this.http.patch<Store>(`/stores/${id}`, data, { headers: authHeader() });
  }
}
