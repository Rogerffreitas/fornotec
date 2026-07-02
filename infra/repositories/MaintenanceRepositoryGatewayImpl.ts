import {
  MaintenanceRepositoryGateway,
  CreateMaintenanceInput,
} from "../../domain/application/gateway/MaintenanceRepositoryGateway";
import { Maintenance } from "../../domain/entities/Maintenance";
import { maintenances } from "./seed";
import { delay, nextId } from "./utils";

export class MaintenanceRepositoryGatewayImpl implements MaintenanceRepositoryGateway {
  async findAll(): Promise<Maintenance[]> {
    return delay([...maintenances]);
  }

  async findByOrderAndOven(orderId: number, ovenId: number): Promise<Maintenance[]> {
    return delay(maintenances.filter((m) => m.orderId === orderId && m.ovenId === ovenId));
  }

  async createMany(data: CreateMaintenanceInput[]): Promise<Maintenance[]> {
    let cursor = nextId(maintenances);
    const now = new Date().toISOString();
    const created: Maintenance[] = data.map((item) => ({ id: cursor++, maintenanceDate: now, ...item }));
    maintenances.push(...created);
    return delay(created);
  }
}
