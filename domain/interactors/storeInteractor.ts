import { StoreUseCase } from "../use-case/storeUseCase";
import { StoreRepositoryGateway } from "../application/gateway/StoreRepositoryGateway";
import { Store, NewStore } from "../entities/Store";

export class StoreInteractor implements StoreUseCase {
  constructor(private readonly gateway: StoreRepositoryGateway) {}

  async findAll(): Promise<Store[]> {
    return this.gateway.findAll();
  }

  async findWithFilter(filter: string): Promise<Store[]> {
    const all = await this.gateway.findAll();
    if (!filter?.trim()) return all;
    const target = filter.trim().toLowerCase();
    return all.filter((s) => s.description.toLowerCase().includes(target));
  }

  async findById(id: number): Promise<Store | undefined> {
    return this.gateway.findById(id);
  }

  async create(data: NewStore): Promise<Store> {
    return this.gateway.create(data);
  }
}
