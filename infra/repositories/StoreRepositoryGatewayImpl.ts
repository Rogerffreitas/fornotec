import { StoreRepositoryGateway } from '../../domain/application/gateway/StoreRepositoryGateway';
import { Store, NewStore, StoreUpdate } from '../../domain/entities/Store';
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

  async update(enterpriseId: string, id: number, data: StoreUpdate): Promise<Store> {
    const store = stores.find((s) => s.id === id && s.enterpriseId === enterpriseId);
    if (!store) throw new Error(`Loja ${id} não encontrada`);
    Object.assign(store, data);
    return delay(store);
  }
}
