import bcrypt from "bcryptjs";
import { Store } from "../../domain/entities/Store";
import { Part, generatePartReference } from "../../domain/entities/Part";
import { Oven } from "../../domain/entities/Oven";
import { OvenPart } from "../../domain/entities/OvenPart";
import { WorkOrder, WorkOrderOven } from "../../domain/entities/WorkOrder";
import { Maintenance } from "../../domain/entities/Maintenance";
import { User } from "../../domain/entities/User";

/**
 * "Banco em memória": estado vive em módulos singleton enquanto o app está
 * aberto. Cada *RepositoryGatewayImpl* em ./*.ts lê/escreve nestes arrays.
 * Quando o back-end real existir, crie um ...RepositoryGatewayImpl usando
 * HttpClient (ver domain/adapters) e troque a instância no infra/ioc/container.ts.
 */

export const users: User[] = [
  { id: 1, name: "Administrador", username: "admin", password: bcrypt.hashSync("admin", 8), role: "technician" },
  { id: 2, name: "Cliente Exemplo", username: "cliente", password: bcrypt.hashSync("cliente", 8), role: "client" },
];

export const stores: Store[] = [
  {
    id: 1,
    description: "Loja Centro",
    address: "Av. Principal, 100 - Centro",
    contactName: "Maria Souza",
    contactNumber: "(85) 99999-0001",
  },
  {
    id: 2,
    description: "Loja Shopping Iguatemi",
    address: "Av. Washington Soares, 85 - Edson Queiroz",
    contactName: "João Lima",
    contactNumber: "(85) 99999-0002",
  },
];

export const parts: Part[] = [
  { id: 1, description: "Resistência blindada", location: "CC", reference: generatePartReference("CC", 1) },
  { id: 2, description: "Sensor de temperatura", location: "PCU", reference: generatePartReference("PCU", 2) },
  { id: 3, description: "Botoeira liga/desliga", location: "PCE", reference: generatePartReference("PCE", 3) },
  { id: 4, description: "Válvula solenoide", location: "GV", reference: generatePartReference("GV", 4) },
  { id: 5, description: "Dobradiça da porta", location: "EE", reference: generatePartReference("EE", 5) },
];

export const ovens: Oven[] = [
  {
    id: 1,
    storeId: 1,
    assetNumber: "PAT-0001",
    description: "Forno combinado 10 GN",
    mark: "Rational",
    voltage: "220V",
    power: "10000W",
    reference: "FRC-10GN",
    lastMaintenance: "2026-04-10T00:00:00.000Z",
    maintenanceFrequency: 90,
    nextMaintenance: "2026-07-09T00:00:00.000Z",
  },
  {
    id: 2,
    storeId: 1,
    assetNumber: "PAT-0002",
    description: "Forno turbo elétrico",
    mark: "Prática",
    voltage: "380V",
    power: "8000W",
    lastMaintenance: null,
    maintenanceFrequency: 60,
    nextMaintenance: null,
  },
  {
    id: 3,
    storeId: 2,
    assetNumber: "PAT-0003",
    description: "Forno combinado 6 GN",
    mark: "Rational",
    voltage: "220V",
    power: "6000W",
    reference: "FRC-06GN",
    lastMaintenance: "2026-05-01T00:00:00.000Z",
    maintenanceFrequency: 90,
    nextMaintenance: "2026-07-30T00:00:00.000Z",
  },
];

export const ovenParts: OvenPart[] = [
  { id: 1, ovenId: 1, partId: 1 },
  { id: 2, ovenId: 1, partId: 2 },
  { id: 3, ovenId: 3, partId: 1 },
];

export const workOrders: WorkOrder[] = [
  { id: 1, storeId: 1, createdAt: "2026-04-10T00:00:00.000Z", status: "finalizada" },
];

export const workOrderOvens: WorkOrderOven[] = [
  { id: 1, orderId: 1, ovenId: 1, observation: "Forno 1 está com problema no aquecimento" },
];

export const maintenances: Maintenance[] = [
  {
    id: 1,
    orderId: 1,
    ovenId: 1,
    partId: 1,
    maintenanceDate: "2026-04-10T00:00:00.000Z",
    serviceType: "Substituição",
    observation: "Resistência trocada, testada e aprovada",
  },
];
