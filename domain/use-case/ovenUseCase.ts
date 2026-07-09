import { Oven, NewOven } from '../entities/Oven';
import { OvenPart } from '../entities/OvenPart';

export interface OvenUseCase {
  findAll(enterpriseId: string): Promise<Oven[]>;
  findByStore(enterpriseId: string, storeId: number, filter?: string): Promise<Oven[]>;
  findById(enterpriseId: string, id: number): Promise<Oven | undefined>;
  create(enterpriseId: string, data: NewOven): Promise<Oven>;
  /** Chamado internamente quando uma ordem de serviço é finalizada. */
  registerCompletedMaintenance(enterpriseId: string, ovenId: number, orderDate: string): Promise<Oven>;
  findPartsOfOven(enterpriseId: string, ovenId: number): Promise<OvenPart[]>;
  addPartsToOven(enterpriseId: string, ovenId: number, partIds: number[]): Promise<OvenPart[]>;
}
