import {
  MaintenanceRepositoryGateway,
  CreateMaintenanceInput,
} from '../../domain/application/gateway/MaintenanceRepositoryGateway';
import { Maintenance } from '../../domain/entities/Maintenance';
import { maintenances } from './seed';
import { delay, nextId } from './utils';

export class MaintenanceRepositoryGatewayImpl implements MaintenanceRepositoryGateway {
  async findAll(enterpriseId: string): Promise<Maintenance[]> {
    return delay(maintenances.filter((m) => m.enterpriseId === enterpriseId));
  }

  async findByOrderAndOven(
    enterpriseId: string,
    orderId: number,
    ovenId: number,
  ): Promise<Maintenance[]> {
    return delay(
      maintenances.filter(
        (m) => m.enterpriseId === enterpriseId && m.orderId === orderId && m.ovenId === ovenId,
      ),
    );
  }

  async createMany(
    enterpriseId: string,
    data: CreateMaintenanceInput[],
  ): Promise<Maintenance[]> {
    let cursor = nextId(maintenances);
    const now = new Date().toISOString();
    const created: Maintenance[] = data.map((item) => ({
      id: cursor++,
      enterpriseId,
      maintenanceDate: now,
      ...item,
    }));
    maintenances.push(...created);
    return delay(created);
  }
}
