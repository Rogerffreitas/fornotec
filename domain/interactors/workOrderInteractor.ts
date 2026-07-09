import { WorkOrderUseCase, OvenOfNewOrder } from '../use-case/workOrderUseCase';
import { WorkOrderRepositoryGateway } from '../application/gateway/WorkOrderRepositoryGateway';
import { WorkOrder, NewWorkOrder, WorkOrderOven } from '../entities/WorkOrder';
import { OvenUseCase } from '../use-case/ovenUseCase';

export class WorkOrderInteractor implements WorkOrderUseCase {
  constructor(
    private readonly gateway: WorkOrderRepositoryGateway,
    private readonly ovenUseCase: OvenUseCase,
  ) {}

  async findAll(): Promise<WorkOrder[]> {
    return this.gateway.findAll();
  }

  async findWithFilter(storeId?: number): Promise<WorkOrder[]> {
    const all = await this.gateway.findAll();
    if (!storeId) return all;
    return all.filter((o) => o.storeId === storeId);
  }

  async findById(id: number): Promise<WorkOrder | undefined> {
    return this.gateway.findById(id);
  }

  async findOvensOfOrder(orderId: number): Promise<WorkOrderOven[]> {
    return this.gateway.findOvensByOrder(orderId);
  }

  async create(
    data: NewWorkOrder,
    ovens: OvenOfNewOrder[],
  ): Promise<{ order: WorkOrder; orderOvens: WorkOrderOven[] }> {
    if (!ovens.length) throw new Error('É obrigatório escolher ao menos um forno.');
    const order = await this.gateway.create(data);
    const orderOvens = await this.gateway.createOvens(
      ovens.map((o) => ({ orderId: order.id, ovenId: o.ovenId, observation: o.observation })),
    );
    return { order, orderOvens };
  }

  /** Finaliza a ordem e propaga última/próxima manutenção para os fornos envolvidos. */
  async finalize(id: number): Promise<WorkOrder> {
    const order = await this.gateway.updateStatus(id, 'finalizada');
    const orderOvens = await this.gateway.findOvensByOrder(id);
    await Promise.all(
      orderOvens.map((oo) =>
        this.ovenUseCase.registerCompletedMaintenance(oo.ovenId, order.createdAt),
      ),
    );
    return order;
  }

  async cancel(id: number): Promise<WorkOrder> {
    return this.gateway.updateStatus(id, 'cancelada');
  }
}
