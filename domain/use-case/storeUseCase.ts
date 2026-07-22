import { Store, NewStore, StoreUpdate } from '../entities/Store';

export interface StoreUseCase {
  findAll(enterpriseId: string): Promise<Store[]>;
  findWithFilter(enterpriseId: string, filter: string): Promise<Store[]>;
  findById(enterpriseId: string, id: number): Promise<Store | undefined>;
  create(enterpriseId: string, data: NewStore): Promise<Store>;
  update(enterpriseId: string, id: number, data: StoreUpdate): Promise<Store>;
}
