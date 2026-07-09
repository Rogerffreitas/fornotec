import { WorkOrder, NewWorkOrder, WorkOrderOven, NewWorkOrderOven } from '../../entities/WorkOrder';
import { WorkOrderStatus } from '../../types';

export interface WorkOrderRepositoryGateway {
  findAll(enterpriseId: string): Promise<WorkOrder[]>;
  findById(enterpriseId: string, id: number): Promise<WorkOrder | undefined>;
  create(enterpriseId: string, data: NewWorkOrder): Promise<WorkOrder>;
  updateStatus(enterpriseId: string, id: number, status: WorkOrderStatus): Promise<WorkOrder>;
  findOvensByOrder(enterpriseId: string, orderId: number): Promise<WorkOrderOven[]>;
  createOvens(enterpriseId: string, data: NewWorkOrderOven[]): Promise<WorkOrderOven[]>;
}
