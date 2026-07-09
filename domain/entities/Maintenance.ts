import { ServiceType } from '../types';

/**
 * Um registro por peça atendida. Ao selecionar N peças no formulário de
 * manutenção, o app cria N registros (mesma orderId/ovenId/maintenanceDate).
 */
export interface Maintenance {
  id: number;
  enterpriseId: string;
  orderId: number;
  ovenId: number;
  partId: number;
  /** Preenchida automaticamente pelo app no momento em que é salva (Date.now()). */
  maintenanceDate: string;
  serviceType: ServiceType;
  observation: string;
}

export type NewMaintenanceItem = {
  partId: number;
  serviceType: ServiceType;
  observation: string;
};
