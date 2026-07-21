import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ListRow, Badge } from '../ListRow';

describe('ListRow', () => {
  it('renders titulo, subtitulo and detalhes', () => {
    render(<ListRow titulo="OS #1" subtitulo="Loja Centro" detalhes="20/07/2026" />);

    expect(screen.getByText('OS #1')).toBeTruthy();
    expect(screen.getByText('Loja Centro')).toBeTruthy();
    expect(screen.getByText('20/07/2026')).toBeTruthy();
  });

  it('omits subtitulo and detalhes when not given', () => {
    render(<ListRow titulo="OS #1" />);

    expect(screen.queryByText('Loja Centro')).toBeNull();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ListRow titulo="OS #1" onPress={onPress} />);

    fireEvent.press(screen.getByText('OS #1'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the tom-based badge when badge is given', () => {
    render(<ListRow titulo="OS #1" badge={{ texto: 'Finalizada', tom: 'sucesso' }} />);

    expect(screen.getByText('Finalizada')).toBeTruthy();
  });

  it('prefers badgeNode over badge when both are given', () => {
    render(
      <ListRow
        titulo="OS #1"
        badge={{ texto: 'Finalizada', tom: 'sucesso' }}
        badgeNode={<Text>Prioridade alta</Text>}
      />,
    );

    expect(screen.getByText('Prioridade alta')).toBeTruthy();
    expect(screen.queryByText('Finalizada')).toBeNull();
  });
});

describe('Badge', () => {
  it('renders its text', () => {
    render(<Badge texto="Pendente" tom="aviso" />);

    expect(screen.getByText('Pendente')).toBeTruthy();
  });
});
