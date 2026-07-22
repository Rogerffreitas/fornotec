import { WorkOrderPriority, WorkOrderStatus } from '../types';
import { TracoAssinatura } from './Signature';

export interface WorkOrder {
  id: number;
  enterpriseId: string;
  storeId: number;
  createdAt: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  /** Preenchidos ao finalizar a ordem — nome digitado e traços da assinatura do cliente. */
  clientSignatureName?: string;
  clientSignatureStrokes?: TracoAssinatura[];
  /** Tamanho do canvas onde a assinatura foi desenhada, pro PDF escalar os traços certinho. */
  clientSignatureCanvasWidth?: number;
  clientSignatureCanvasHeight?: number;
}

export type NewWorkOrder = {
  storeId: number;
  /** Opcional — o backend usa 'media' quando omitida. */
  priority?: WorkOrderPriority;
};

/** Um forno atendido pela ordem, com sua observação — ex: "forno 1 está com problema xyz". */
export interface WorkOrderOven {
  id: number;
  enterpriseId: string;
  orderId: number;
  ovenId: number;
  observation: string;
}

export type NewWorkOrderOven = Omit<WorkOrderOven, 'id' | 'enterpriseId'>;
