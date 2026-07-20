import React from 'react';
import { Badge, Tom } from './ListRow';
import { WorkOrderStatus } from '../domain/types';

const STATUS_INFO: Record<WorkOrderStatus, { texto: string; tom: Tom }> = {
  finalizada: { texto: 'Finalizada', tom: 'sucesso' },
  cancelada: { texto: 'Cancelada', tom: 'perigo' },
  pendente: { texto: 'Pendente', tom: 'aviso' },
};

export function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  const { texto, tom } = STATUS_INFO[status];
  return <Badge texto={texto} tom={tom} />;
}
