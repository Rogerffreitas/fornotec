import { OvenRepositoryGateway } from '../../domain/application/gateway/OvenRepositoryGateway';
import { Oven, NewOven, OvenUpdate } from '../../domain/entities/Oven';
import { OvenPart } from '../../domain/entities/OvenPart';
import { ovens, ovenParts } from './seed';
import { delay, nextId } from './utils';

export class OvenRepositoryGatewayImpl implements OvenRepositoryGateway {
  async findAll(enterpriseId: string): Promise<Oven[]> {
    return delay(ovens.filter((o) => o.enterpriseId === enterpriseId));
  }

  async findByStore(enterpriseId: string, storeId: number): Promise<Oven[]> {
    return delay(ovens.filter((o) => o.enterpriseId === enterpriseId && o.storeId === storeId));
  }

  async findById(enterpriseId: string, id: number): Promise<Oven | undefined> {
    return delay(ovens.find((o) => o.id === id && o.enterpriseId === enterpriseId));
  }

  async create(enterpriseId: string, data: NewOven): Promise<Oven> {
    const oven: Oven = {
      id: nextId(ovens),
      enterpriseId,
      ...data,
      lastMaintenance: null,
      nextMaintenance: null,
    };
    ovens.push(oven);
    return delay(oven);
  }

  async update(enterpriseId: string, id: number, data: OvenUpdate): Promise<Oven> {
    const oven = ovens.find((o) => o.id === id && o.enterpriseId === enterpriseId);
    if (!oven) throw new Error(`Forno ${id} não encontrado`);
    Object.assign(oven, data);
    return delay(oven);
  }

  async updateMaintenanceDates(
    enterpriseId: string,
    id: number,
    lastMaintenance: string,
    nextMaintenance: string,
  ): Promise<Oven> {
    const oven = ovens.find((o) => o.id === id && o.enterpriseId === enterpriseId);
    if (!oven) throw new Error(`Forno ${id} não encontrado`);
    oven.lastMaintenance = lastMaintenance;
    oven.nextMaintenance = nextMaintenance;
    return delay(oven);
  }

  async findPartsByOven(enterpriseId: string, ovenId: number): Promise<OvenPart[]> {
    return delay(ovenParts.filter((op) => op.enterpriseId === enterpriseId && op.ovenId === ovenId));
  }

  async addParts(enterpriseId: string, ovenId: number, partIds: number[]): Promise<OvenPart[]> {
    let cursor = nextId(ovenParts);
    const created: OvenPart[] = partIds.map((partId) => ({
      id: cursor++,
      enterpriseId,
      ovenId,
      partId,
    }));
    ovenParts.push(...created);
    return delay(created);
  }
}
