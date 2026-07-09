import { WorkOrderStatus } from '../types';

export interface WorkOrder {
  id: number;
  storeId: number;
  createdAt: string;
  status: WorkOrderStatus;
}

export type NewWorkOrder = {
  storeId: number;
};

/** Um forno atendido pela ordem, com sua observação — ex: "forno 1 está com problema xyz". */
export interface WorkOrderOven {
  id: number;
  orderId: number;
  ovenId: number;
  observation: string;
}

export type NewWorkOrderOven = Omit<WorkOrderOven, 'id'>;
