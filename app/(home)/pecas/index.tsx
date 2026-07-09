import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Part } from '../../../domain/entities/Part';
import { findLocation } from '../../../domain/types';
import { partUseCase } from '../../../infra/ioc/container';
import { spacing } from '../../../components/theme';
import { useAuth } from '@/context/AuthContext';

export default function Pecas() {
  const { user } = useAuth();
  const [pecas, setPecas] = useState<Part[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(
    async (texto: string) => {
      setCarregando(true);
      setPecas(await partUseCase.findWithFilter(user!.enterpriseId, texto));
      setCarregando(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      carregar(filtro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  function handleFiltro(texto: string) {
    setFiltro(texto);
    carregar(texto);
  }

  return (
    <Screen>
      <FilterInput
        valor={filtro}
        aoMudar={handleFiltro}
        placeholder="Filtrar por descrição ou referência..."
      />
      <FlatList
        data={pecas}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={() => carregar(filtro)}
        ListEmptyComponent={<EmptyState texto="Nenhuma peça encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`${item.reference} · ${item.description}`}
            subtitulo={findLocation(item.location).description}
          />
        )}
      />
      <PrimaryButton
        titulo="+ Nova peça"
        onPress={() => router.push('/pecas/nova-peca')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
