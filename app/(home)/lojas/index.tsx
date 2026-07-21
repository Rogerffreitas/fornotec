import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Store } from '../../../domain/entities/Store';
import { storeUseCase } from '../../../infra/ioc/container';
import { spacing } from '../../../components/theme';
import { useAuth } from '@/context/AuthContext';

export default function Lojas() {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(
    async (texto: string) => {
      setCarregando(true);
      setLojas(await storeUseCase.findWithFilter(user!.enterpriseId, texto));
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
      <FilterInput valor={filtro} aoMudar={handleFiltro} placeholder="Filtrar por descrição..." />
      <FlatList
        data={lojas}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={() => carregar(filtro)}
        ListEmptyComponent={<EmptyState texto="Nenhuma loja encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={item.description}
            subtitulo={item.address}
            detalhes={[item.contactName, item.contactNumber, item.email].filter(Boolean).join(' · ')}
          />
        )}
      />
      <PrimaryButton
        titulo="+ Nova loja"
        onPress={() => router.push('/lojas/nova-loja')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
