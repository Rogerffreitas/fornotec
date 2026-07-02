import { Maintenance } from "../../entities/Maintenance";
import { ServiceType } from "../../types";

export interface CreateMaintenanceInput {
  orderId: number;
  ovenId: number;
  partId: number;
  serviceType: ServiceType;
  observation: string;
}

export interface MaintenanceRepositoryGateway {
  findAll(): Promise<Maintenance[]>;
  findByOrderAndOven(orderId: number, ovenId: number): Promise<Maintenance[]>;
  createMany(data: CreateMaintenanceInput[]): Promise<Maintenance[]>;
}
