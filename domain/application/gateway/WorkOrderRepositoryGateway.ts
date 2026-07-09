import { WorkOrder, NewWorkOrder, WorkOrderOven, NewWorkOrderOven } from '../../entities/WorkOrder';
import { WorkOrderStatus } from '../../types';

export interface WorkOrderRepositoryGateway {
  findAll(): Promise<WorkOrder[]>;
  findById(id: number): Promise<WorkOrder | undefined>;
  create(data: NewWorkOrder): Promise<WorkOrder>;
  updateStatus(id: number, status: WorkOrderStatus): Promise<WorkOrder>;
  findOvensByOrder(orderId: number): Promise<WorkOrderOven[]>;
  createOvens(data: NewWorkOrderOven[]): Promise<WorkOrderOven[]>;
}
