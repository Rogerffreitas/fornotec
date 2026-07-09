import { Oven, NewOven } from '../entities/Oven';
import { OvenPart } from '../entities/OvenPart';

export interface OvenUseCase {
  findAll(): Promise<Oven[]>;
  findByStore(storeId: number, filter?: string): Promise<Oven[]>;
  findById(id: number): Promise<Oven | undefined>;
  create(data: NewOven): Promise<Oven>;
  /** Chamado internamente quando uma ordem de serviço é finalizada. */
  registerCompletedMaintenance(ovenId: number, orderDate: string): Promise<Oven>;
  findPartsOfOven(ovenId: number): Promise<OvenPart[]>;
  addPartsToOven(ovenId: number, partIds: number[]): Promise<OvenPart[]>;
}
