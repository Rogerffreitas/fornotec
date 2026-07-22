import { StoreUseCase } from '../use-case/storeUseCase';
import { StoreRepositoryGateway } from '../application/gateway/StoreRepositoryGateway';
import { Store, NewStore, StoreUpdate } from '../entities/Store';

export class StoreInteractor implements StoreUseCase {
  constructor(private readonly gateway: StoreRepositoryGateway) {}

  async findAll(enterpriseId: string): Promise<Store[]> {
    return this.gateway.findAll(enterpriseId);
  }

  async findWithFilter(enterpriseId: string, filter: string): Promise<Store[]> {
    const all = await this.gateway.findAll(enterpriseId);
    if (!filter?.trim()) return all;
    const target = filter.trim().toLowerCase();
    return all.filter((s) => s.description.toLowerCase().includes(target));
  }

  async findById(enterpriseId: string, id: number): Promise<Store | undefined> {
    return this.gateway.findById(enterpriseId, id);
  }

  async create(enterpriseId: string, data: NewStore): Promise<Store> {
    return this.gateway.create(enterpriseId, data);
  }

  async update(enterpriseId: string, id: number, data: StoreUpdate): Promise<Store> {
    return this.gateway.update(enterpriseId, id, data);
  }
}
