import { WorkOrder, NewWorkOrder, WorkOrderOven, NewWorkOrderOven } from '../../entities/WorkOrder';
import { WorkOrderStatus } from '../../types';
import { AssinaturaCliente } from '../../entities/Signature';

export interface WorkOrderRepositoryGateway {
  findAll(enterpriseId: string): Promise<WorkOrder[]>;
  findById(enterpriseId: string, id: number): Promise<WorkOrder | undefined>;
  create(enterpriseId: string, data: NewWorkOrder): Promise<WorkOrder>;
  /** `assinatura` só é obrigatória (e enviada) ao finalizar — cancelar não passa nada aqui. */
  updateStatus(
    enterpriseId: string,
    id: number,
    status: WorkOrderStatus,
    assinatura?: AssinaturaCliente,
  ): Promise<WorkOrder>;
  findOvensByOrder(enterpriseId: string, orderId: number): Promise<WorkOrderOven[]>;
  createOvens(enterpriseId: string, data: NewWorkOrderOven[]): Promise<WorkOrderOven[]>;
}
