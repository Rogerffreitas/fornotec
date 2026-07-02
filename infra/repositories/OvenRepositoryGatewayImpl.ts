import { OvenRepositoryGateway } from "../../domain/application/gateway/OvenRepositoryGateway";
import { Oven, NewOven } from "../../domain/entities/Oven";
import { OvenPart } from "../../domain/entities/OvenPart";
import { ovens, ovenParts } from "./seed";
import { delay, nextId } from "./utils";

export class OvenRepositoryGatewayImpl implements OvenRepositoryGateway {
  async findAll(): Promise<Oven[]> {
    return delay([...ovens]);
  }

  async findByStore(storeId: number): Promise<Oven[]> {
    return delay(ovens.filter((o) => o.storeId === storeId));
  }

  async findById(id: number): Promise<Oven | undefined> {
    return delay(ovens.find((o) => o.id === id));
  }

  async create(data: NewOven): Promise<Oven> {
    const oven: Oven = { id: nextId(ovens), ...data, lastMaintenance: null, nextMaintenance: null };
    ovens.push(oven);
    return delay(oven);
  }

  async updateMaintenanceDates(id: number, lastMaintenance: string, nextMaintenance: string): Promise<Oven> {
    const oven = ovens.find((o) => o.id === id);
    if (!oven) throw new Error(`Forno ${id} não encontrado`);
    oven.lastMaintenance = lastMaintenance;
    oven.nextMaintenance = nextMaintenance;
    return delay(oven);
  }

  async findPartsByOven(ovenId: number): Promise<OvenPart[]> {
    return delay(ovenParts.filter((op) => op.ovenId === ovenId));
  }

  async addParts(ovenId: number, partIds: number[]): Promise<OvenPart[]> {
    let cursor = nextId(ovenParts);
    const created: OvenPart[] = partIds.map((partId) => ({ id: cursor++, ovenId, partId }));
    ovenParts.push(...created);
    return delay(created);
  }
}
