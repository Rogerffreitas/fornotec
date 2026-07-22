import { WorkOrderUseCase, OvenOfNewOrder } from '../use-case/workOrderUseCase';
import { WorkOrderRepositoryGateway } from '../application/gateway/WorkOrderRepositoryGateway';
import { WorkOrder, NewWorkOrder, WorkOrderOven } from '../entities/WorkOrder';
import { AssinaturaCliente } from '../entities/Signature';
import { OvenUseCase } from '../use-case/ovenUseCase';

export class WorkOrderInteractor implements WorkOrderUseCase {
  constructor(
    private readonly gateway: WorkOrderRepositoryGateway,
    private readonly ovenUseCase: OvenUseCase,
  ) {}

  async findAll(enterpriseId: string): Promise<WorkOrder[]> {
    return this.gateway.findAll(enterpriseId);
  }

  async findWithFilter(enterpriseId: string, storeId?: number): Promise<WorkOrder[]> {
    const all = await this.gateway.findAll(enterpriseId);
    if (!storeId) return all;
    return all.filter((o) => o.storeId === storeId);
  }

  async findById(enterpriseId: string, id: number): Promise<WorkOrder | undefined> {
    return this.gateway.findById(enterpriseId, id);
  }

  async findOvensOfOrder(enterpriseId: string, orderId: number): Promise<WorkOrderOven[]> {
    return this.gateway.findOvensByOrder(enterpriseId, orderId);
  }

  async create(
    enterpriseId: string,
    data: NewWorkOrder,
    ovens: OvenOfNewOrder[],
  ): Promise<{ order: WorkOrder; orderOvens: WorkOrderOven[] }> {
    if (!ovens.length) throw new Error('É obrigatório escolher ao menos um forno.');
    const order = await this.gateway.create(enterpriseId, data);
    const orderOvens = await this.gateway.createOvens(
      enterpriseId,
      ovens.map((o) => ({ orderId: order.id, ovenId: o.ovenId, observation: o.observation })),
    );
    return { order, orderOvens };
  }

  /** Finaliza a ordem, registra a assinatura do cliente e propaga última/próxima manutenção para os fornos envolvidos. */
  async finalize(enterpriseId: string, id: number, assinatura: AssinaturaCliente): Promise<WorkOrder> {
    const order = await this.gateway.updateStatus(enterpriseId, id, 'finalizada', assinatura);
    const orderOvens = await this.gateway.findOvensByOrder(enterpriseId, id);
    await Promise.all(
      orderOvens.map((oo) =>
        this.ovenUseCase.registerCompletedMaintenance(enterpriseId, oo.ovenId, order.createdAt),
      ),
    );
    return order;
  }

  async cancel(enterpriseId: string, id: number): Promise<WorkOrder> {
    return this.gateway.updateStatus(enterpriseId, id, 'cancelada');
  }
}
