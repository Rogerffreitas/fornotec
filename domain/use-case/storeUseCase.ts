import { Store, NewStore } from '../entities/Store';

export interface StoreUseCase {
  findAll(): Promise<Store[]>;
  findWithFilter(filter: string): Promise<Store[]>;
  findById(id: number): Promise<Store | undefined>;
  create(data: NewStore): Promise<Store>;
}
