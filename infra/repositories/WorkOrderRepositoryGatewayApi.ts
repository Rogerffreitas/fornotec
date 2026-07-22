import { WorkOrderRepositoryGateway } from '../../domain/application/gateway/WorkOrderRepositoryGateway';
import { WorkOrder, NewWorkOrder, WorkOrderOven, NewWorkOrderOven } from '../../domain/entities/WorkOrder';
import { AssinaturaCliente, TracoAssinatura } from '../../domain/entities/Signature';
import { WorkOrderStatus } from '../../domain/types';
import { HttpClient, HttpError } from '../../domain/application/infra/HttpClient';
import { authHeader } from '../security/session';

type ClientSignaturePayload = { tracos: TracoAssinatura[]; largura: number; altura: number };

/** Formato bruto retornado pela API: assinatura vem como um único JSON serializado num campo de texto. */
type WorkOrderBruta = Omit<
  WorkOrder,
  'clientSignatureStrokes' | 'clientSignatureCanvasWidth' | 'clientSignatureCanvasHeight'
> & { clientSignatureData?: string };

function mapearOrdem(bruta: WorkOrderBruta): WorkOrder {
  const { clientSignatureData, ...resto } = bruta;
  if (!clientSignatureData) return resto as WorkOrder;

  const payload: ClientSignaturePayload = JSON.parse(clientSignatureData);
  return {
    ...resto,
    clientSignatureStrokes: payload.tracos,
    clientSignatureCanvasWidth: payload.largura,
    clientSignatureCanvasHeight: payload.altura,
  };
}

export class WorkOrderRepositoryGatewayApi implements WorkOrderRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async findAll(_enterpriseId: string): Promise<WorkOrder[]> {
    const resultado = await this.http.get<WorkOrderBruta[]>('/work-orders', { headers: authHeader() });
    return resultado.map(mapearOrdem);
  }

  async findById(_enterpriseId: string, id: number): Promise<WorkOrder | undefined> {
    try {
      const resultado = await this.http.get<WorkOrderBruta>(`/work-orders/${id}`, {
        headers: authHeader(),
      });
      return mapearOrdem(resultado);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return undefined;
      throw error;
    }
  }

  async create(_enterpriseId: string, data: NewWorkOrder): Promise<WorkOrder> {
    const resultado = await this.http.post<WorkOrderBruta>('/work-orders', data, {
      headers: authHeader(),
    });
    return mapearOrdem(resultado);
  }

  async updateStatus(
    _enterpriseId: string,
    id: number,
    status: WorkOrderStatus,
    assinatura?: AssinaturaCliente,
  ): Promise<WorkOrder> {
    const payload: ClientSignaturePayload | undefined = assinatura
      ? { tracos: assinatura.tracos, largura: assinatura.largura, altura: assinatura.altura }
      : undefined;
    const resultado = await this.http.patch<WorkOrderBruta>(
      `/work-orders/${id}/status`,
      {
        status,
        ...(assinatura
          ? {
              clientSignatureName: assinatura.nome,
              clientSignatureData: JSON.stringify(payload),
            }
          : {}),
      },
      { headers: authHeader() },
    );
    return mapearOrdem(resultado);
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
