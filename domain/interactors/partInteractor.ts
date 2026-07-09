import { PartUseCase } from '../use-case/partUseCase';
import { PartRepositoryGateway } from '../application/gateway/PartRepositoryGateway';
import { Part, NewPart } from '../entities/Part';

export class PartInteractor implements PartUseCase {
  constructor(private readonly gateway: PartRepositoryGateway) {}

  async findAll(enterpriseId: string): Promise<Part[]> {
    return this.gateway.findAll(enterpriseId);
  }

  async findWithFilter(enterpriseId: string, filter: string): Promise<Part[]> {
    const all = await this.gateway.findAll(enterpriseId);
    if (!filter?.trim()) return all;
    const target = filter.trim().toLowerCase();
    return all.filter(
      (p) =>
        p.description.toLowerCase().includes(target) || p.reference.toLowerCase().includes(target),
    );
  }

  async findByIds(enterpriseId: string, ids: number[]): Promise<Part[]> {
    return this.gateway.findByIds(enterpriseId, ids);
  }

  async create(enterpriseId: string, data: NewPart): Promise<Part> {
    return this.gateway.create(enterpriseId, data);
  }
}
