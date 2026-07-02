import { PartRepositoryGateway } from "../../domain/application/gateway/PartRepositoryGateway";
import { Part, NewPart, generatePartReference } from "../../domain/entities/Part";
import { parts } from "./seed";
import { delay, nextId } from "./utils";

export class PartRepositoryGatewayImpl implements PartRepositoryGateway {
  async findAll(): Promise<Part[]> {
    return delay([...parts]);
  }

  async findByIds(ids: number[]): Promise<Part[]> {
    return delay(parts.filter((p) => ids.includes(p.id)));
  }

  async findById(id: number): Promise<Part | undefined> {
    return delay(parts.find((p) => p.id === id));
  }

  async create(data: NewPart): Promise<Part> {
    const id = nextId(parts);
    const part: Part = { id, ...data, reference: generatePartReference(data.location, id) };
    parts.push(part);
    return delay(part);
  }
}
