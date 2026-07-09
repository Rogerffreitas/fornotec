import { WorkOrderRepositoryGateway } from '../../domain/application/gateway/WorkOrderRepositoryGateway';
import {
  WorkOrder,
  NewWorkOrder,
  WorkOrderOven,
  NewWorkOrderOven,
} from '../../domain/entities/WorkOrder';
import { WorkOrderStatus } from '../../domain/types';
import { workOrders, workOrderOvens } from './seed';
import { delay, nextId } from './utils';

export class WorkOrderRepositoryGatewayImpl implements WorkOrderRepositoryGateway {
  async findAll(enterpriseId: string): Promise<WorkOrder[]> {
    return delay(workOrders.filter((o) => o.enterpriseId === enterpriseId));
  }

  async findById(enterpriseId: string, id: number): Promise<WorkOrder | undefined> {
    return delay(workOrders.find((o) => o.id === id && o.enterpriseId === enterpriseId));
  }

  async create(enterpriseId: string, data: NewWorkOrder): Promise<WorkOrder> {
    const order: WorkOrder = {
      id: nextId(workOrders),
      enterpriseId,
      storeId: data.storeId,
      createdAt: new Date().toISOString(),
      status: 'pendente',
    };
    workOrders.push(order);
    return delay(order);
  }

  async updateStatus(
    enterpriseId: string,
    id: number,
    status: WorkOrderStatus,
  ): Promise<WorkOrder> {
    const order = workOrders.find((o) => o.id === id && o.enterpriseId === enterpriseId);
    if (!order) throw new Error(`Ordem ${id} não encontrada`);
    order.status = status;
    return delay(order);
  }

  async findOvensByOrder(enterpriseId: string, orderId: number): Promise<WorkOrderOven[]> {
    return delay(
      workOrderOvens.filter((oo) => oo.enterpriseId === enterpriseId && oo.orderId === orderId),
    );
  }

  async createOvens(
    enterpriseId: string,
    data: NewWorkOrderOven[],
  ): Promise<WorkOrderOven[]> {
    let cursor = nextId(workOrderOvens);
    const created: WorkOrderOven[] = data.map((item) => ({
      id: cursor++,
      enterpriseId,
      ...item,
    }));
    workOrderOvens.push(...created);
    return delay(created);
  }
}
