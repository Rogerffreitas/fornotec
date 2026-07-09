import { Oven, NewOven } from '../../entities/Oven';
import { OvenPart } from '../../entities/OvenPart';

export interface OvenRepositoryGateway {
  findAll(): Promise<Oven[]>;
  findByStore(storeId: number): Promise<Oven[]>;
  findById(id: number): Promise<Oven | undefined>;
  create(data: NewOven): Promise<Oven>;
  updateMaintenanceDates(
    id: number,
    lastMaintenance: string,
    nextMaintenance: string,
  ): Promise<Oven>;
  findPartsByOven(ovenId: number): Promise<OvenPart[]>;
  addParts(ovenId: number, partIds: number[]): Promise<OvenPart[]>;
}
