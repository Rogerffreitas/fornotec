import { Part, NewPart, PartUpdate } from '../../entities/Part';

export interface PartRepositoryGateway {
  findAll(enterpriseId: string): Promise<Part[]>;
  findByIds(enterpriseId: string, ids: number[]): Promise<Part[]>;
  findById(enterpriseId: string, id: number): Promise<Part | undefined>;
  create(enterpriseId: string, data: NewPart): Promise<Part>;
  update(enterpriseId: string, id: number, data: PartUpdate): Promise<Part>;
}
