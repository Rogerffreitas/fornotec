import { Part, NewPart } from '../../entities/Part';

export interface PartRepositoryGateway {
  findAll(): Promise<Part[]>;
  findByIds(ids: number[]): Promise<Part[]>;
  findById(id: number): Promise<Part | undefined>;
  create(data: NewPart): Promise<Part>;
}
