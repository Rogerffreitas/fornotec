import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useEditOven } from '../../../../../app/(home)/fornos/[fornoId]/useEditOven';
import { useAuth } from '@/context/AuthContext';
import { storeUseCase, ovenUseCase } from '../../../../../infra/ioc/container';
import { router } from 'expo-router';
import { Store } from '../../../../../domain/entities/Store';
import { Oven } from '../../../../../domain/entities/Oven';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../infra/ioc/container', () => ({
  storeUseCase: { findById: jest.fn() },
  ovenUseCase: { findById: jest.fn(), update: jest.fn() },
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ fornoId: '9' }),
  router: { back: jest.fn() },
}));

const useAuthMock = useAuth as jest.Mock;
const findStoreByIdMock = storeUseCase.findById as jest.Mock;
const findOvenByIdMock = ovenUseCase.findById as jest.Mock;
const updateMock = ovenUseCase.update as jest.Mock;
const backMock = router.back as jest.Mock;

function buildStore(overrides: Partial<Store> = {}): Store {
  return { id: 1, enterpriseId: 'ent-1', description: 'Loja Centro', address: 'Rua A, 123', ...overrides };
}

function buildOven(overrides: Partial<Oven> = {}): Oven {
  return {
    id: 9,
    enterpriseId: 'ent-1',
    storeId: 1,
    assetNumber: 'PAT-01',
    description: 'Forno combinado',
    lastMaintenance: null,
    maintenanceFrequency: 90,
    nextMaintenance: null,
    ...overrides,
  };
}

beforeEach(() => {
  useAuthMock.mockReturnValue({ user: { enterpriseId: 'ent-1' } });
  findStoreByIdMock.mockReset();
  findOvenByIdMock.mockReset();
  updateMock.mockReset();
  backMock.mockReset();
});

describe('useEditOven', () => {
  it('loads the oven and its store', async () => {
    findOvenByIdMock.mockResolvedValue(buildOven());
    findStoreByIdMock.mockResolvedValue(buildStore());
    const { result } = renderHook(() => useEditOven());

    await waitFor(() => expect(result.current.carregado).toBe(true));

    expect(findOvenByIdMock).toHaveBeenCalledWith('ent-1', 9);
    expect(result.current.loja).toEqual(buildStore());
    expect(result.current.description).toBe('Forno combinado');
    expect(result.current.maintenanceFrequency).toBe('90');
  });

  it('flags naoEncontrado when the oven does not exist', async () => {
    findOvenByIdMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEditOven());

    await waitFor(() => expect(result.current.carregado).toBe(true));

    expect(result.current.naoEncontrado).toBe(true);
  });

  it('salvar rejects an invalid maintenance frequency', async () => {
    findOvenByIdMock.mockResolvedValue(buildOven());
    findStoreByIdMock.mockResolvedValue(buildStore());
    const { result } = renderHook(() => useEditOven());
    await waitFor(() => expect(result.current.carregado).toBe(true));

    act(() => {
      result.current.setMaintenanceFrequency('0');
    });
    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.erro).toMatch(/periodicidade/);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('salvar updates the oven and navigates back', async () => {
    findOvenByIdMock.mockResolvedValue(buildOven());
    findStoreByIdMock.mockResolvedValue(buildStore());
    updateMock.mockResolvedValue(buildOven());
    const { result } = renderHook(() => useEditOven());
    await waitFor(() => expect(result.current.carregado).toBe(true));

    await act(async () => {
      await result.current.salvar();
    });

    expect(updateMock).toHaveBeenCalledWith(
      'ent-1',
      9,
      expect.objectContaining({ description: 'Forno combinado', maintenanceFrequency: 90 }),
    );
    expect(backMock).toHaveBeenCalled();
  });
});
