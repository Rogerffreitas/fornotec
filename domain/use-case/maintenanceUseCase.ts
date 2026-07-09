import { Maintenance, NewMaintenanceItem } from '../entities/Maintenance';

export interface MaintenanceUseCase {
  findAll(enterpriseId: string): Promise<Maintenance[]>;
  findByOrderAndOven(enterpriseId: string, orderId: number, ovenId: number): Promise<Maintenance[]>;
  register(
    enterpriseId: string,
    orderId: number,
    ovenId: number,
    items: NewMaintenanceItem[],
  ): Promise<Maintenance[]>;
}
