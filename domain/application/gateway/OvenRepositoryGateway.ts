import { Oven, NewOven, OvenUpdate } from '../../entities/Oven';
import { OvenPart } from '../../entities/OvenPart';

export interface OvenRepositoryGateway {
  findAll(enterpriseId: string): Promise<Oven[]>;
  findByStore(enterpriseId: string, storeId: number): Promise<Oven[]>;
  findById(enterpriseId: string, id: number): Promise<Oven | undefined>;
  create(enterpriseId: string, data: NewOven): Promise<Oven>;
  update(enterpriseId: string, id: number, data: OvenUpdate): Promise<Oven>;
  updateMaintenanceDates(
    enterpriseId: string,
    id: number,
    lastMaintenance: string,
    nextMaintenance: string,
  ): Promise<Oven>;
  findPartsByOven(enterpriseId: string, ovenId: number): Promise<OvenPart[]>;
  addParts(enterpriseId: string, ovenId: number, partIds: number[]): Promise<OvenPart[]>;
}
