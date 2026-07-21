export interface Store {
  id: number;
  enterpriseId: string;
  /** Obrigatório, máx. 100 caracteres. */
  description: string;
  /** Obrigatório, máx. 100 caracteres. */
  address: string;
  /** Opcional, máx. 100 caracteres. */
  contactName?: string;
  /** Opcional, máx. 100 caracteres. */
  contactNumber?: string;
  /** Opcional, máx. 100 caracteres. */
  email?: string;
}

export type NewStore = Omit<Store, 'id' | 'enterpriseId'>;

export const STORE_FIELD_MAX_LENGTH = 100;
