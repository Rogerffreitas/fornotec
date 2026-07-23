import {
  MaintenanceRepositoryGateway,
  CreateMaintenanceInput,
  MaintenanceFilters,
  MaintenancePage,
} from '../../domain/application/gateway/MaintenanceRepositoryGateway';
import { Maintenance } from '../../domain/entities/Maintenance';
import { maintenances, ovens } from './seed';
import { delay, nextId } from './utils';

export class MaintenanceRepositoryGatewayImpl implements MaintenanceRepositoryGateway {
  async findAll(enterpriseId: string): Promise<Maintenance[]> {
    return delay(maintenances.filter((m) => m.enterpriseId === enterpriseId));
  }

  async findByOrder(enterpriseId: string, orderId: number): Promise<Maintenance[]> {
    return delay(
      maintenances.filter((m) => m.enterpriseId === enterpriseId && m.orderId === orderId),
    );
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

  async findByStore(enterpriseId: string, storeId: number): Promise<Maintenance[]> {
    const ovenIdsDaLoja = new Set(
      ovens.filter((o) => o.enterpriseId === enterpriseId && o.storeId === storeId).map((o) => o.id),
    );
    return delay(
      maintenances.filter((m) => m.enterpriseId === enterpriseId && ovenIdsDaLoja.has(m.ovenId)),
    );
  }

  async findPage(enterpriseId: string, filters: MaintenanceFilters): Promise<MaintenancePage> {
    const ovenIdsDaLoja = filters.storeId
      ? new Set(
          ovens
            .filter((o) => o.enterpriseId === enterpriseId && o.storeId === filters.storeId)
            .map((o) => o.id),
        )
      : null;
    const todas = maintenances.filter(
      (m) =>
        m.enterpriseId === enterpriseId &&
        (!filters.ovenId || m.ovenId === filters.ovenId) &&
        (!ovenIdsDaLoja || ovenIdsDaLoja.has(m.ovenId)),
    );
    const inicio = (filters.page - 1) * filters.pageSize;
    return delay({ items: todas.slice(inicio, inicio + filters.pageSize), total: todas.length });
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

  async remove(enterpriseId: string, id: number): Promise<void> {
    const index = maintenances.findIndex((m) => m.enterpriseId === enterpriseId && m.id === id);
    if (index !== -1) maintenances.splice(index, 1);
    return delay(undefined);
  }
}
