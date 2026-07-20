import { WorkOrderRepositoryGateway } from '../../domain/application/gateway/WorkOrderRepositoryGateway';
import { WorkOrder, NewWorkOrder, WorkOrderOven, NewWorkOrderOven } from '../../domain/entities/WorkOrder';
import { WorkOrderStatus } from '../../domain/types';
import { HttpClient, HttpError } from '../../domain/application/infra/HttpClient';
import { authHeader } from '../security/session';

export class WorkOrderRepositoryGatewayApi implements WorkOrderRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async findAll(_enterpriseId: string): Promise<WorkOrder[]> {
    return this.http.get<WorkOrder[]>('/work-orders', { headers: authHeader() });
  }

  async findById(_enterpriseId: string, id: number): Promise<WorkOrder | undefined> {
    try {
      return await this.http.get<WorkOrder>(`/work-orders/${id}`, { headers: authHeader() });
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return undefined;
      throw error;
    }
  }

  async create(_enterpriseId: string, data: NewWorkOrder): Promise<WorkOrder> {
    return this.http.post<WorkOrder>('/work-orders', data, { headers: authHeader() });
  }

  async updateStatus(_enterpriseId: string, id: number, status: WorkOrderStatus): Promise<WorkOrder> {
    return this.http.patch<WorkOrder>(`/work-orders/${id}/status`, { status }, { headers: authHeader() });
  }

  async findOvensByOrder(_enterpriseId: string, orderId: number): Promise<WorkOrderOven[]> {
    return this.http.get<WorkOrderOven[]>(`/work-orders/${orderId}/ovens`, { headers: authHeader() });
  }

  /** Todos os itens de `data` compartilham o mesmo orderId (garantido pelo WorkOrderInteractor.create). */
  async createOvens(_enterpriseId: string, data: NewWorkOrderOven[]): Promise<WorkOrderOven[]> {
    if (!data.length) return [];
    const orderId = data[0].orderId;
    return this.http.post<WorkOrderOven[]>(
      `/work-orders/${orderId}/ovens`,
      { ovens: data.map((d) => ({ ovenId: d.ovenId, observation: d.observation })) },
      { headers: authHeader() },
    );
  }
}
