import { WorkOrder, NewWorkOrder, WorkOrderOven } from '../entities/WorkOrder';

export interface OvenOfNewOrder {
  ovenId: number;
  observation: string;
}

export interface WorkOrderUseCase {
  findAll(enterpriseId: string): Promise<WorkOrder[]>;
  findWithFilter(enterpriseId: string, storeId?: number): Promise<WorkOrder[]>;
  findById(enterpriseId: string, id: number): Promise<WorkOrder | undefined>;
  findOvensOfOrder(enterpriseId: string, orderId: number): Promise<WorkOrderOven[]>;
  create(
    enterpriseId: string,
    data: NewWorkOrder,
    ovens: OvenOfNewOrder[],
  ): Promise<{ order: WorkOrder; orderOvens: WorkOrderOven[] }>;
  finalize(enterpriseId: string, id: number): Promise<WorkOrder>;
  cancel(enterpriseId: string, id: number): Promise<WorkOrder>;
}
