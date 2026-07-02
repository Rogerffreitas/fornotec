/** Papel do usuário no sistema. O checkbox de login escolhe entre technician/client. */
export type Role = "admin" | "client" | "technician";

/** Status da ordem de serviço. */
export const WORK_ORDER_STATUSES = ["pendente", "finalizada", "cancelada"] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

/** Serviço executado em uma peça durante uma manutenção. */
export const SERVICE_TYPES = ["Substituição", "Inspeção", "Manutenção"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

/** Localização física da peça dentro do forno. */
export type LocationRef = "CC" | "PCU" | "PCE" | "GV" | "EE";

export interface Location {
  description: string;
  ref: LocationRef;
}

export const LOCATIONS: Location[] = [
  { description: "Câmara de Cocção", ref: "CC" },
  { description: "Painel de Controle", ref: "PCU" },
  { description: "Painel de Comandos", ref: "PCE" },
  { description: "Gerador de Vapor", ref: "GV" },
  { description: "Estrutura Externa", ref: "EE" },
];

export function findLocation(ref: LocationRef): Location {
  const location = LOCATIONS.find((l) => l.ref === ref);
  if (!location) throw new Error(`Localização desconhecida: ${ref}`);
  return location;
}
