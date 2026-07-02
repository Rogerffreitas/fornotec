export interface Store {
  id: number;
  /** Obrigatório, máx. 100 caracteres. */
  description: string;
  /** Obrigatório, máx. 100 caracteres. */
  address: string;
  /** Opcional, máx. 100 caracteres. */
  contactName?: string;
  /** Opcional, máx. 100 caracteres. */
  contactNumber?: string;
}

export type NewStore = Omit<Store, "id">;

export const STORE_FIELD_MAX_LENGTH = 100;
