import { MaintenanceUseCase } from '../use-case/maintenanceUseCase';
import { MaintenanceRepositoryGateway } from '../application/gateway/MaintenanceRepositoryGateway';
import { Maintenance, NewMaintenanceItem } from '../entities/Maintenance';

export class MaintenanceInteractor implements MaintenanceUseCase {
  constructor(private readonly gateway: MaintenanceRepositoryGateway) {}

  async findAll(enterpriseId: string): Promise<Maintenance[]> {
    return this.gateway.findAll(enterpriseId);
  }

  async findByOrderAndOven(
    enterpriseId: string,
    orderId: number,
    ovenId: number,
  ): Promise<Maintenance[]> {
    return this.gateway.findByOrderAndOven(enterpriseId, orderId, ovenId);
  }

  /** Registra um lote — um registro por peça selecionada no formulário. */
  async register(
    enterpriseId: string,
    orderId: number,
    ovenId: number,
    items: NewMaintenanceItem[],
  ): Promise<Maintenance[]> {
    return this.gateway.createMany(
      enterpriseId,
      items.map((item) => ({
        orderId,
        ovenId,
        partId: item.partId,
        serviceType: item.serviceType,
        observation: item.observation,
      })),
    );
  }
}
