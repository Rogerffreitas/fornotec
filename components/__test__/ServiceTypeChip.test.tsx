import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ServiceTypeChip } from '../ServiceTypeChip';
import { SERVICE_TYPES } from '../../domain/types';

describe('ServiceTypeChip', () => {
  it('renders the raw service type label for every known type', () => {
    SERVICE_TYPES.forEach((tipo) => {
      render(<ServiceTypeChip tipo={tipo} />);
      expect(screen.getByText(tipo)).toBeTruthy();
    });
  });

  it('fires onPress when used as a selectable chip', () => {
    const onPress = jest.fn();
    render(<ServiceTypeChip tipo="Substituição" onPress={onPress} />);

    fireEvent.press(screen.getByText('Substituição'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not respond to presses when onPress is not given (badge mode)', () => {
    const onPress = jest.fn();
    render(<ServiceTypeChip tipo="Inspeção" />);

    fireEvent.press(screen.getByText('Inspeção'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
