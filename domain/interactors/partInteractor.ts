import { PartUseCase } from '../use-case/partUseCase';
import { PartRepositoryGateway } from '../application/gateway/PartRepositoryGateway';
import { Part, NewPart } from '../entities/Part';

export class PartInteractor implements PartUseCase {
  constructor(private readonly gateway: PartRepositoryGateway) {}

  async findAll(): Promise<Part[]> {
    return this.gateway.findAll();
  }

  async findWithFilter(filter: string): Promise<Part[]> {
    const all = await this.gateway.findAll();
    if (!filter?.trim()) return all;
    const target = filter.trim().toLowerCase();
    return all.filter(
      (p) =>
        p.description.toLowerCase().includes(target) || p.reference.toLowerCase().includes(target),
    );
  }

  async findByIds(ids: number[]): Promise<Part[]> {
    return this.gateway.findByIds(ids);
  }

  async create(data: NewPart): Promise<Part> {
    return this.gateway.create(data);
  }
}
