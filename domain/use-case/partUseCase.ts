import { Part, NewPart } from '../entities/Part';

export interface PartUseCase {
  findAll(enterpriseId: string): Promise<Part[]>;
  findWithFilter(enterpriseId: string, filter: string): Promise<Part[]>;
  findByIds(enterpriseId: string, ids: number[]): Promise<Part[]>;
  create(enterpriseId: string, data: NewPart): Promise<Part>;
}
