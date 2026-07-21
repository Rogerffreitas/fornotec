import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WorkOrderStatusBadge } from '../WorkOrderStatusBadge';

describe('WorkOrderStatusBadge', () => {
  it('shows "Pendente" for a pendente order', () => {
    render(<WorkOrderStatusBadge status="pendente" />);
    expect(screen.getByText('Pendente')).toBeTruthy();
  });

  it('shows "Finalizada" for a finalizada order', () => {
    render(<WorkOrderStatusBadge status="finalizada" />);
    expect(screen.getByText('Finalizada')).toBeTruthy();
  });

  it('shows "Cancelada" for a cancelada order', () => {
    render(<WorkOrderStatusBadge status="cancelada" />);
    expect(screen.getByText('Cancelada')).toBeTruthy();
  });
});
