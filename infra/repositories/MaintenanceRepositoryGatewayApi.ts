import {
  MaintenanceRepositoryGateway,
  CreateMaintenanceInput,
} from '../../domain/application/gateway/MaintenanceRepositoryGateway';
import { Maintenance } from '../../domain/entities/Maintenance';
import { HttpClient } from '../../domain/application/infra/HttpClient';
import { authHeader } from '../security/session';

export class MaintenanceRepositoryGatewayApi implements MaintenanceRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async findAll(_enterpriseId: string): Promise<Maintenance[]> {
    return this.http.get<Maintenance[]>('/maintenances', { headers: authHeader() });
  }

  async findByOrderAndOven(
    _enterpriseId: string,
    orderId: number,
    ovenId: number,
  ): Promise<Maintenance[]> {
    return this.http.get<Maintenance[]>('/maintenances', {
      headers: authHeader(),
      params: { orderId, ovenId },
    });
  }

  /** Todos os itens de `data` compartilham orderId/ovenId (garantido pelo MaintenanceInteractor.register). */
  async createMany(_enterpriseId: string, data: CreateMaintenanceInput[]): Promise<Maintenance[]> {
    if (!data.length) return [];
    const { orderId, ovenId } = data[0];
    return this.http.post<Maintenance[]>(
      '/maintenances',
      {
        orderId,
        ovenId,
        items: data.map((d) => ({
          partId: d.partId,
          serviceType: d.serviceType,
          observation: d.observation,
        })),
      },
      { headers: authHeader() },
    );
  }
}
