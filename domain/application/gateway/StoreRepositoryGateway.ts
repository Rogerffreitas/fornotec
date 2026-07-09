import { Store, NewStore } from '../../entities/Store';

export interface StoreRepositoryGateway {
  findAll(): Promise<Store[]>;
  findById(id: number): Promise<Store | undefined>;
  create(data: NewStore): Promise<Store>;
}
