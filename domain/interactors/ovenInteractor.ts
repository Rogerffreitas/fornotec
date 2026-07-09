import { OvenUseCase } from '../use-case/ovenUseCase';
import { OvenRepositoryGateway } from '../application/gateway/OvenRepositoryGateway';
import { Oven, NewOven, computeNextMaintenance } from '../entities/Oven';
import { OvenPart } from '../entities/OvenPart';

export class OvenInteractor implements OvenUseCase {
  constructor(private readonly gateway: OvenRepositoryGateway) {}

  async findAll(): Promise<Oven[]> {
    return this.gateway.findAll();
  }

  async findByStore(storeId: number, filter?: string): Promise<Oven[]> {
    const all = await this.gateway.findByStore(storeId);
    if (!filter?.trim()) return all;
    const target = filter.trim().toLowerCase();
    return all.filter(
      (o) =>
        o.description.toLowerCase().includes(target) ||
        (o.assetNumber ?? '').toLowerCase().includes(target),
    );
  }

  async findById(id: number): Promise<Oven | undefined> {
    return this.gateway.findById(id);
  }

  async create(data: NewOven): Promise<Oven> {
    return this.gateway.create(data);
  }

  /** última manutenção = data da ordem finalizada; próxima = última + periodicidade. */
  async registerCompletedMaintenance(ovenId: number, orderDate: string): Promise<Oven> {
    const oven = await this.gateway.findById(ovenId);
    if (!oven) throw new Error(`Forno ${ovenId} não encontrado`);
    const next = computeNextMaintenance(orderDate, oven.maintenanceFrequency);
    return this.gateway.updateMaintenanceDates(ovenId, orderDate, next);
  }

  async findPartsOfOven(ovenId: number): Promise<OvenPart[]> {
    return this.gateway.findPartsByOven(ovenId);
  }

  async addPartsToOven(ovenId: number, partIds: number[]): Promise<OvenPart[]> {
    if (!partIds.length) return [];
    return this.gateway.addParts(ovenId, partIds);
  }
}
