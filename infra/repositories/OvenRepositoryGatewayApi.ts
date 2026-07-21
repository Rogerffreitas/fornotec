import { OvenRepositoryGateway } from '../../domain/application/gateway/OvenRepositoryGateway';
import { Oven, NewOven, OvenUpdate } from '../../domain/entities/Oven';
import { OvenPart } from '../../domain/entities/OvenPart';
import { HttpClient, HttpError } from '../../domain/application/infra/HttpClient';
import { authHeader } from '../security/session';

export class OvenRepositoryGatewayApi implements OvenRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async findAll(_enterpriseId: string): Promise<Oven[]> {
    return this.http.get<Oven[]>('/ovens', { headers: authHeader() });
  }

  async findByStore(_enterpriseId: string, storeId: number): Promise<Oven[]> {
    return this.http.get<Oven[]>('/ovens', { headers: authHeader(), params: { storeId } });
  }

  async findById(_enterpriseId: string, id: number): Promise<Oven | undefined> {
    try {
      return await this.http.get<Oven>(`/ovens/${id}`, { headers: authHeader() });
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return undefined;
      throw error;
    }
  }

  async create(_enterpriseId: string, data: NewOven): Promise<Oven> {
    return this.http.post<Oven>('/ovens', data, { headers: authHeader() });
  }

  async update(_enterpriseId: string, id: number, data: OvenUpdate): Promise<Oven> {
    return this.http.patch<Oven>(`/ovens/${id}`, data, { headers: authHeader() });
  }

  async updateMaintenanceDates(
    _enterpriseId: string,
    id: number,
    lastMaintenance: string,
    nextMaintenance: string,
  ): Promise<Oven> {
    return this.http.patch<Oven>(
      `/ovens/${id}/maintenance-dates`,
      { lastMaintenance, nextMaintenance },
      { headers: authHeader() },
    );
  }

  async findPartsByOven(_enterpriseId: string, ovenId: number): Promise<OvenPart[]> {
    return this.http.get<OvenPart[]>(`/ovens/${ovenId}/parts`, { headers: authHeader() });
  }

  async addParts(_enterpriseId: string, ovenId: number, partIds: number[]): Promise<OvenPart[]> {
    return this.http.post<OvenPart[]>(`/ovens/${ovenId}/parts`, { partIds }, { headers: authHeader() });
  }
}
