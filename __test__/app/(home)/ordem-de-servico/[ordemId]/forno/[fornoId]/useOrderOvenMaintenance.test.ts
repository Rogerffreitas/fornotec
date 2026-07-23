import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOrderOvenMaintenance } from '../../../../../../../app/(home)/ordem-de-servico/[ordemId]/forno/[fornoId]/useOrderOvenMaintenance';
import { useAuth } from '@/context/AuthContext';
import { ovenUseCase, partUseCase, maintenanceUseCase } from '../../../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { Part } from '../../../../../../../domain/entities/Part';
import { Maintenance } from '../../../../../../../domain/entities/Maintenance';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../../../infra/ioc/container', () => ({
  ovenUseCase: { findPartsOfOven: jest.fn() },
  partUseCase: { findByIds: jest.fn() },
  maintenanceUseCase: { findByOrderAndOven: jest.fn(), register: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ ordemId: '10', fornoId: '7' }),
  router: { back: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findPartsOfOvenMock = ovenUseCase.findPartsOfOven as jest.Mock;
const findPartsByIdsMock = partUseCase.findByIds as jest.Mock;
const findByOrderAndOvenMock = maintenanceUseCase.findByOrderAndOven as jest.Mock;
const registerMock = maintenanceUseCase.register as jest.Mock;
const backMock = router.back as jest.Mock;

function buildPart(overrides: Partial<Part> = {}): Part {
  return { id: 1, enterpriseId: 'ent-1', description: 'Termostato', location: 'CC', reference: 'CC001', ...overrides };
}

function buildMaintenance(overrides: Partial<Maintenance> = {}): Maintenance {
  return {
    id: 1,
    enterpriseId: 'ent-1',
    orderId: 10,
    ovenId: 7,
    partId: 1,
    maintenanceDate: '2026-07-20T00:00:00.000Z',
    serviceType: 'Inspeção',
    observation: '',
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findPartsOfOvenMock.mockReset();
  findPartsByIdsMock.mockReset();
  findByOrderAndOvenMock.mockReset();
  registerMock.mockReset();
  backMock.mockReset();
});

describe('useOrderOvenMaintenance', () => {
  it('loads the oven parts and what was already registered for this order+oven', async () => {
    findPartsOfOvenMock.mockResolvedValue([{ id: 1, enterpriseId: 'ent-1', ovenId: 7, partId: 1 }]);
    findPartsByIdsMock.mockResolvedValue([buildPart()]);
    findByOrderAndOvenMock.mockResolvedValue([buildMaintenance()]);

    const { result } = renderHook(() => useOrderOvenMaintenance());

    await waitFor(() => expect(result.current.pecasDoForno).toEqual([buildPart()]));
    expect(findByOrderAndOvenMock).toHaveBeenCalledWith('ent-1', 10, 7);
    expect(result.current.jaRegistradas).toEqual([buildMaintenance()]);
    expect(result.current.nomePeca(1)).toBe('CC001 · Termostato');
  });

  it('adicionarItem requires a part and a service type, then queues it and clears the form', async () => {
    findPartsOfOvenMock.mockResolvedValue([]);
    findPartsByIdsMock.mockResolvedValue([]);
    findByOrderAndOvenMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOrderOvenMaintenance());
    await waitFor(() => expect(result.current.pecasDoForno).toEqual([]));

    act(() => result.current.adicionarItem());
    expect(result.current.erro).toMatch(/peça.*serviço/i);

    act(() => {
      result.current.setPartId(1);
      result.current.setServico('Inspeção');
      result.current.setObservacao('Ok');
    });
    act(() => result.current.adicionarItem());

    expect(result.current.pendentes).toEqual([
      { partId: 1, serviceType: 'Inspeção', observation: 'Ok' },
    ]);
    expect(result.current.partId).toBeNull();
    expect(result.current.servico).toBeNull();
    expect(result.current.observacao).toBe('');
  });

  it('removerPendente removes the item at the given index', async () => {
    findPartsOfOvenMock.mockResolvedValue([]);
    findPartsByIdsMock.mockResolvedValue([]);
    findByOrderAndOvenMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOrderOvenMaintenance());
    await waitFor(() => expect(result.current.pecasDoForno).toEqual([]));

    act(() => {
      result.current.setPartId(1);
      result.current.setServico('Inspeção');
    });
    act(() => result.current.adicionarItem());
    act(() => result.current.removerPendente(0));

    expect(result.current.pendentes).toEqual([]);
  });

  it('salvarTudo registers every pending item at once and navigates back', async () => {
    findPartsOfOvenMock.mockResolvedValue([]);
    findPartsByIdsMock.mockResolvedValue([]);
    findByOrderAndOvenMock.mockResolvedValue([]);
    registerMock.mockResolvedValue([]);
    const { result } = renderHook(() => useOrderOvenMaintenance());
    await waitFor(() => expect(result.current.pecasDoForno).toEqual([]));

    act(() => {
      result.current.setPartId(1);
      result.current.setServico('Inspeção');
    });
    act(() => result.current.adicionarItem());

    await act(async () => {
      await result.current.salvarTudo();
    });

    expect(registerMock).toHaveBeenCalledWith('ent-1', 10, 7, [
      { partId: 1, serviceType: 'Inspeção', observation: '' },
    ]);
    expect(backMock).toHaveBeenCalled();
  });
});
