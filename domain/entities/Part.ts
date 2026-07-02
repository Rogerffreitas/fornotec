import { LocationRef } from "../types";

export interface Part {
  id: number;
  /** Obrigatório, máx. 100 caracteres. */
  description: string;
  location: LocationRef;
  /** Gerada automaticamente: `${location}00${id}` (ex: CC005). */
  reference: string;
}

export type NewPart = Omit<Part, "id" | "reference">;

export const PART_FIELD_MAX_LENGTH = 100;

/** Regra de negócio de geração da referência da peça. */
export function generatePartReference(location: LocationRef, id: number): string {
  return `${location}00${id}`;
}
