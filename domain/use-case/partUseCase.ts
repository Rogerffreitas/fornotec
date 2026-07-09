import { Part, NewPart } from '../entities/Part';

export interface PartUseCase {
  findAll(): Promise<Part[]>;
  findWithFilter(filter: string): Promise<Part[]>;
  findByIds(ids: number[]): Promise<Part[]>;
  create(data: NewPart): Promise<Part>;
}
