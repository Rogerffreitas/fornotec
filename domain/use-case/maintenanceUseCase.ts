import { Maintenance, NewMaintenanceItem } from '../entities/Maintenance';
import { MaintenanceFilters, MaintenancePage } from '../application/gateway/MaintenanceRepositoryGateway';

export interface MaintenanceUseCase {
  findAll(enterpriseId: string): Promise<Maintenance[]>;
  findByOrder(enterpriseId: string, orderId: number): Promise<Maintenance[]>;
  findByOrderAndOven(enterpriseId: string, orderId: number, ovenId: number): Promise<Maintenance[]>;
  findPage(enterpriseId: string, filters: MaintenanceFilters): Promise<MaintenancePage>;
  register(
    enterpriseId: string,
    orderId: number,
    ovenId: number,
    items: NewMaintenanceItem[],
  ): Promise<Maintenance[]>;
  remove(enterpriseId: string, id: number): Promise<void>;
}
