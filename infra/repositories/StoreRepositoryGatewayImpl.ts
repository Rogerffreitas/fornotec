import { StoreRepositoryGateway } from '../../domain/application/gateway/StoreRepositoryGateway';
import { Store, NewStore } from '../../domain/entities/Store';
import { stores } from './seed';
import { delay, nextId } from './utils';

export class StoreRepositoryGatewayImpl implements StoreRepositoryGateway {
  async findAll(enterpriseId: string): Promise<Store[]> {
    return delay(stores.filter((s) => s.enterpriseId === enterpriseId));
  }

  async findById(enterpriseId: string, id: number): Promise<Store | undefined> {
    return delay(stores.find((s) => s.id === id && s.enterpriseId === enterpriseId));
  }

  async create(enterpriseId: string, data: NewStore): Promise<Store> {
    const store: Store = { id: nextId(stores), enterpriseId, ...data };
    stores.push(store);
    return delay(store);
  }
}
