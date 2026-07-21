import { PartRepositoryGateway } from '../../domain/application/gateway/PartRepositoryGateway';
import { Part, NewPart } from '../../domain/entities/Part';
import { HttpClient, HttpError } from '../../domain/application/infra/HttpClient';
import { authHeader } from '../security/session';

export class PartRepositoryGatewayApi implements PartRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async findAll(_enterpriseId: string): Promise<Part[]> {
    return this.http.get<Part[]>('/parts', { headers: authHeader() });
  }

  async findByIds(_enterpriseId: string, ids: number[]): Promise<Part[]> {
    if (!ids.length) return [];
    return this.http.post<Part[]>('/parts/search', { ids }, { headers: authHeader() });
  }

  async findById(_enterpriseId: string, id: number): Promise<Part | undefined> {
    try {
      return await this.http.get<Part>(`/parts/${id}`, { headers: authHeader() });
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return undefined;
      throw error;
    }
  }

  async create(_enterpriseId: string, data: NewPart): Promise<Part> {
    return this.http.post<Part>('/parts', data, { headers: authHeader() });
  }
}
