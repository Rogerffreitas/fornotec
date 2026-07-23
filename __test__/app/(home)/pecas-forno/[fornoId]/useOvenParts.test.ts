import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOvenParts } from '../../../../../app/(home)/pecas-forno/[fornoId]/useOvenParts';
import { useAuth } from '@/context/AuthContext';
import { partUseCase, ovenUseCase } from '../../../../../infra/ioc/container';
import { Part } from '../../../../../domain/entities/Part';
import { OvenPart } from '../../../../../domain/entities/OvenPart';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  partUseCase: { findAll: jest.fn() },
  ovenUseCase: { findPartsOfOven: jest.fn(), addPartsToOven: jest.fn() },
}));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ fornoId: '7' }) }));

const useAuthMock = useAuth as jest.Mock;
const findAllPartsMock = partUseCase.findAll as jest.Mock;
const findPartsOfOvenMock = ovenUseCase.findPartsOfOven as jest.Mock;
const addPartsToOvenMock = ovenUseCase.addPartsToOven as jest.Mock;

function buildPart(overrides: Partial<Part> = {}): Part {
  return { id: 1, enterpriseId: 'ent-1', description: 'Termostato', location: 'CC', reference: 'CC001', ...overrides };
}

function buildOvenPart(overrides: Partial<OvenPart> = {}): OvenPart {
  return { id: 1, enterpriseId: 'ent-1', ovenId: 7, partId: 1, ...overrides };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findAllPartsMock.mockReset();
  findPartsOfOvenMock.mockReset();
  addPartsToOvenMock.mockReset();
});

describe('useOvenParts', () => {
  it('splits parts into already-linked vs available', async () => {
    findAllPartsMock.mockResolvedValue([buildPart({ id: 1 }), buildPart({ id: 2 })]);
    findPartsOfOvenMock.mockResolvedValue([buildOvenPart({ partId: 1 })]);
    const { result } = renderHook(() => useOvenParts());

    await waitFor(() => expect(result.current.pecasJaLigadas).toHaveLength(1));

    expect(result.current.pecasJaLigadas).toEqual([buildPart({ id: 1 })]);
    expect(result.current.pecasDisponiveis).toEqual([buildPart({ id: 2 })]);
  });

  it('alternarSelecao toggles a part id in/out of the selection', async () => {
    findAllPartsMock.mockResolvedValue([buildPart({ id: 2 })]);
    findPartsOfOvenMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOvenParts());
    await waitFor(() => expect(result.current.pecasDisponiveis).toHaveLength(1));

    act(() => result.current.alternarSelecao(2));
    expect(result.current.selecionadas).toEqual([2]);

    act(() => result.current.alternarSelecao(2));
    expect(result.current.selecionadas).toEqual([]);
  });

  it('salvar associates the selected parts and reloads', async () => {
    findAllPartsMock.mockResolvedValue([buildPart({ id: 2 })]);
    findPartsOfOvenMock.mockResolvedValue([]);
    addPartsToOvenMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOvenParts());
    await waitFor(() => expect(result.current.pecasDisponiveis).toHaveLength(1));

    act(() => result.current.alternarSelecao(2));
    await act(async () => {
      await result.current.salvar();
    });

    expect(addPartsToOvenMock).toHaveBeenCalledWith('ent-1', 7, [2]);
    expect(findPartsOfOvenMock).toHaveBeenCalledTimes(2);
  });
});
