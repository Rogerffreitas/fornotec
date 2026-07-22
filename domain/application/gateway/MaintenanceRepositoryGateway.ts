import { Maintenance } from '../../entities/Maintenance';
import { ServiceType } from '../../types';

export interface CreateMaintenanceInput {
  orderId: number;
  ovenId: number;
  partId: number;
  serviceType: ServiceType;
  observation: string;
}

export interface MaintenanceFilters {
  storeId?: number;
  ovenId?: number;
  page: number;
  pageSize: number;
}

export interface MaintenancePage {
  items: Maintenance[];
  total: number;
}

export interface MaintenanceRepositoryGateway {
  findAll(enterpriseId: string): Promise<Maintenance[]>;
  findByOrder(enterpriseId: string, orderId: number): Promise<Maintenance[]>;
  findByOrderAndOven(enterpriseId: string, orderId: number, ovenId: number): Promise<Maintenance[]>;
  findPage(enterpriseId: string, filters: MaintenanceFilters): Promise<MaintenancePage>;
  createMany(enterpriseId: string, data: CreateMaintenanceInput[]): Promise<Maintenance[]>;
  remove(enterpriseId: string, id: number): Promise<void>;
}
