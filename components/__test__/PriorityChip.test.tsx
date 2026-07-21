import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PriorityChip } from '../PriorityChip';

describe('PriorityChip', () => {
  it('renders the Portuguese label for each priority', () => {
    render(<PriorityChip prioridade="baixa" />);
    expect(screen.getByText('Baixa')).toBeTruthy();

    render(<PriorityChip prioridade="media" />);
    expect(screen.getByText('Média')).toBeTruthy();

    render(<PriorityChip prioridade="alta" />);
    expect(screen.getByText('Alta')).toBeTruthy();

    render(<PriorityChip prioridade="urgente" />);
    expect(screen.getByText('Urgente')).toBeTruthy();
  });

  it('fires onPress when used as a selectable chip', () => {
    const onPress = jest.fn();
    render(<PriorityChip prioridade="alta" onPress={onPress} />);

    fireEvent.press(screen.getByText('Alta'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without a Pressable wrapper when onPress is not given (badge mode)', () => {
    const onPress = jest.fn();
    render(<PriorityChip prioridade="urgente" />);

    fireEvent.press(screen.getByText('Urgente'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
