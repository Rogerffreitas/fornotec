export interface Oven {
  id: number;
  /** Obrigatório. */
  storeId: number;
  /** Opcional — número da etiqueta de patrimônio. */
  assetNumber?: string;
  /** Obrigatório, máx. 100 caracteres. */
  description: string;
  /** Opcional. */
  mark?: string;
  /** Opcional. Ex: 110V, 220V, 380V. */
  voltage?: string;
  /** Opcional. Ex: 1000W. */
  power?: string;
  /** Opcional, campo livre digitado pelo usuário. */
  reference?: string;
  /** Data da última ordem de serviço finalizada envolvendo este forno. */
  lastMaintenance: string | null;
  /** Obrigatório, em dias. */
  maintenanceFrequency: number;
  /** Calculada = lastMaintenance + maintenanceFrequency. */
  nextMaintenance: string | null;
}

export type NewOven = Omit<Oven, 'id' | 'lastMaintenance' | 'nextMaintenance'>;

export const OVEN_DESCRIPTION_MAX_LENGTH = 100;

/** Regra de negócio: próxima manutenção = última manutenção + periodicidade (dias). */
export function computeNextMaintenance(
  lastMaintenanceISO: string,
  maintenanceFrequencyDays: number,
): string {
  const date = new Date(lastMaintenanceISO);
  date.setDate(date.getDate() + maintenanceFrequencyDays);
  return date.toISOString();
}
