import { WorkOrder, NewWorkOrder, WorkOrderOven } from '../entities/WorkOrder';

export interface OvenOfNewOrder {
  ovenId: number;
  observation: string;
}

export interface WorkOrderUseCase {
  findAll(): Promise<WorkOrder[]>;
  findWithFilter(storeId?: number): Promise<WorkOrder[]>;
  findById(id: number): Promise<WorkOrder | undefined>;
  findOvensOfOrder(orderId: number): Promise<WorkOrderOven[]>;
  create(
    data: NewWorkOrder,
    ovens: OvenOfNewOrder[],
  ): Promise<{ order: WorkOrder; orderOvens: WorkOrderOven[] }>;
  finalize(id: number): Promise<WorkOrder>;
  cancel(id: number): Promise<WorkOrder>;
}
