import { PartRepositoryGateway } from '../../domain/application/gateway/PartRepositoryGateway';
import { Part, NewPart, PartUpdate, generatePartReference } from '../../domain/entities/Part';
import { parts } from './seed';
import { delay, nextId } from './utils';

export class PartRepositoryGatewayImpl implements PartRepositoryGateway {
  async findAll(enterpriseId: string): Promise<Part[]> {
    return delay(parts.filter((p) => p.enterpriseId === enterpriseId));
  }

  async findByIds(enterpriseId: string, ids: number[]): Promise<Part[]> {
    return delay(parts.filter((p) => p.enterpriseId === enterpriseId && ids.includes(p.id)));
  }

  async findById(enterpriseId: string, id: number): Promise<Part | undefined> {
    return delay(parts.find((p) => p.id === id && p.enterpriseId === enterpriseId));
  }

  async create(enterpriseId: string, data: NewPart): Promise<Part> {
    const id = nextId(parts);
    const part: Part = { id, enterpriseId, ...data, reference: generatePartReference(data.location, id) };
    parts.push(part);
    return delay(part);
  }

  async update(enterpriseId: string, id: number, data: PartUpdate): Promise<Part> {
    const part = parts.find((p) => p.id === id && p.enterpriseId === enterpriseId);
    if (!part) throw new Error(`Peça ${id} não encontrada`);
    Object.assign(part, data, { reference: generatePartReference(data.location, id) });
    return delay(part);
  }
}
