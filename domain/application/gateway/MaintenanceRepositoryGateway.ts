import { Maintenance } from '../../entities/Maintenance';
import { ServiceType } from '../../types';

export interface CreateMaintenanceInput {
  orderId: number;
  ovenId: number;
  partId: number;
  serviceType: ServiceType;
  observation: string;
}

export interface MaintenanceRepositoryGateway {
  findAll(enterpriseId: string): Promise<Maintenance[]>;
  findByOrderAndOven(enterpriseId: string, orderId: number, ovenId: number): Promise<Maintenance[]>;
  createMany(enterpriseId: string, data: CreateMaintenanceInput[]): Promise<Maintenance[]>;
}
