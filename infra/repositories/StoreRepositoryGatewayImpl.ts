import { StoreRepositoryGateway } from '../../domain/application/gateway/StoreRepositoryGateway';
import { Store, NewStore } from '../../domain/entities/Store';
import { stores } from './seed';
import { delay, nextId } from './utils';

export class StoreRepositoryGatewayImpl implements StoreRepositoryGateway {
  async findAll(): Promise<Store[]> {
    return delay([...stores]);
  }

  async findById(id: number): Promise<Store | undefined> {
    return delay(stores.find((s) => s.id === id));
  }

  async create(data: NewStore): Promise<Store> {
    const store: Store = { id: nextId(stores), ...data };
    stores.push(store);
    return delay(store);
  }
}
