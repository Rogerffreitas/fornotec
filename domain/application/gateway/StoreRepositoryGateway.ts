import { Store, NewStore } from '../../entities/Store';

export interface StoreRepositoryGateway {
  findAll(enterpriseId: string): Promise<Store[]>;
  findById(enterpriseId: string, id: number): Promise<Store | undefined>;
  create(enterpriseId: string, data: NewStore): Promise<Store>;
}
