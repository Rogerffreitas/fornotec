import { OvenUseCase } from '../use-case/ovenUseCase';
import { OvenRepositoryGateway } from '../application/gateway/OvenRepositoryGateway';
import { Oven, NewOven, computeNextMaintenance } from '../entities/Oven';
import { OvenPart } from '../entities/OvenPart';

export class OvenInteractor implements OvenUseCase {
  constructor(private readonly gateway: OvenRepositoryGateway) {}

  async findAll(enterpriseId: string): Promise<Oven[]> {
    return this.gateway.findAll(enterpriseId);
  }

  async findByStore(enterpriseId: string, storeId: number, filter?: string): Promise<Oven[]> {
    const all = await this.gateway.findByStore(enterpriseId, storeId);
    if (!filter?.trim()) return all;
    const target = filter.trim().toLowerCase();
    return all.filter(
      (o) =>
        o.description.toLowerCase().includes(target) ||
        (o.assetNumber ?? '').toLowerCase().includes(target),
    );
  }

  async findById(enterpriseId: string, id: number): Promise<Oven | undefined> {
    return this.gateway.findById(enterpriseId, id);
  }

  async create(enterpriseId: string, data: NewOven): Promise<Oven> {
    return this.gateway.create(enterpriseId, data);
  }

  /** última manutenção = data da ordem finalizada; próxima = última + periodicidade. */
  async registerCompletedMaintenance(
    enterpriseId: string,
    ovenId: number,
    orderDate: string,
  ): Promise<Oven> {
    const oven = await this.gateway.findById(enterpriseId, ovenId);
    if (!oven) throw new Error(`Forno ${ovenId} não encontrado`);
    const next = computeNextMaintenance(orderDate, oven.maintenanceFrequency);
    return this.gateway.updateMaintenanceDates(enterpriseId, ovenId, orderDate, next);
  }

  async findPartsOfOven(enterpriseId: string, ovenId: number): Promise<OvenPart[]> {
    return this.gateway.findPartsByOven(enterpriseId, ovenId);
  }

  async addPartsToOven(enterpriseId: string, ovenId: number, partIds: number[]): Promise<OvenPart[]> {
    if (!partIds.length) return [];
    return this.gateway.addParts(enterpriseId, ovenId, partIds);
  }
}
