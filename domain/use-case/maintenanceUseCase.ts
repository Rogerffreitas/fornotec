import { Maintenance, NewMaintenanceItem } from '../entities/Maintenance';

export interface MaintenanceUseCase {
  findAll(): Promise<Maintenance[]>;
  findByOrderAndOven(orderId: number, ovenId: number): Promise<Maintenance[]>;
  register(orderId: number, ovenId: number, items: NewMaintenanceItem[]): Promise<Maintenance[]>;
}
