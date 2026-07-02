import { MaintenanceUseCase } from "../use-case/maintenanceUseCase";
import { MaintenanceRepositoryGateway } from "../application/gateway/MaintenanceRepositoryGateway";
import { Maintenance, NewMaintenanceItem } from "../entities/Maintenance";

export class MaintenanceInteractor implements MaintenanceUseCase {
  constructor(private readonly gateway: MaintenanceRepositoryGateway) {}

  async findAll(): Promise<Maintenance[]> {
    return this.gateway.findAll();
  }

  async findByOrderAndOven(orderId: number, ovenId: number): Promise<Maintenance[]> {
    return this.gateway.findByOrderAndOven(orderId, ovenId);
  }

  /** Registra um lote — um registro por peça selecionada no formulário. */
  async register(orderId: number, ovenId: number, items: NewMaintenanceItem[]): Promise<Maintenance[]> {
    return this.gateway.createMany(
      items.map((item) => ({
        orderId,
        ovenId,
        partId: item.partId,
        serviceType: item.serviceType,
        observation: item.observation,
      }))
    );
  }
}
