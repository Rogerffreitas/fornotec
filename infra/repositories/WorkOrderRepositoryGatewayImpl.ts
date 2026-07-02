import { WorkOrderRepositoryGateway } from "../../domain/application/gateway/WorkOrderRepositoryGateway";
import { WorkOrder, NewWorkOrder, WorkOrderOven, NewWorkOrderOven } from "../../domain/entities/WorkOrder";
import { WorkOrderStatus } from "../../domain/types";
import { workOrders, workOrderOvens } from "./seed";
import { delay, nextId } from "./utils";

export class WorkOrderRepositoryGatewayImpl implements WorkOrderRepositoryGateway {
  async findAll(): Promise<WorkOrder[]> {
    return delay([...workOrders]);
  }

  async findById(id: number): Promise<WorkOrder | undefined> {
    return delay(workOrders.find((o) => o.id === id));
  }

  async create(data: NewWorkOrder): Promise<WorkOrder> {
    const order: WorkOrder = {
      id: nextId(workOrders),
      storeId: data.storeId,
      createdAt: new Date().toISOString(),
      status: "pendente",
    };
    workOrders.push(order);
    return delay(order);
  }

  async updateStatus(id: number, status: WorkOrderStatus): Promise<WorkOrder> {
    const order = workOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Ordem ${id} não encontrada`);
    order.status = status;
    return delay(order);
  }

  async findOvensByOrder(orderId: number): Promise<WorkOrderOven[]> {
    return delay(workOrderOvens.filter((oo) => oo.orderId === orderId));
  }

  async createOvens(data: NewWorkOrderOven[]): Promise<WorkOrderOven[]> {
    let cursor = nextId(workOrderOvens);
    const created: WorkOrderOven[] = data.map((item) => ({ id: cursor++, ...item }));
    workOrderOvens.push(...created);
    return delay(created);
  }
}
