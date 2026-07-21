import React, { useCallback, useEffect, useState } from 'react';
import { Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Store } from '../../../domain/entities/Store';
import { Oven } from '../../../domain/entities/Oven';
import { storeUseCase, ovenUseCase } from '../../../infra/ioc/container';
import { colors, spacing, radius } from '../../../components/theme';
import { useAuth } from '@/context/AuthContext';

function formatarData(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Fornos() {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then((resultado) => {
      setLojas(resultado);
      setStoreId((atual) => atual ?? resultado[0]?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregar = useCallback(
    async (id: number, texto: string) => {
      setCarregando(true);
      setFornos(await ovenUseCase.findByStore(user!.enterpriseId, id, texto));
      setCarregando(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      if (storeId) carregar(storeId, filtro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeId]),
  );

  return (
    <Screen>
      <Text style={styles.rotulo}>Loja</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={lojas}
        keyExtractor={(item) => String(item.id)}
        style={styles.chipsLista}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setStoreId(item.id)}
            style={[styles.chip, storeId === item.id && styles.chipSelecionado]}
          >
            <Text style={[styles.chipTexto, storeId === item.id && styles.chipTextoSelecionado]}>
              {item.description}
            </Text>
          </Pressable>
        )}
      />

      <FilterInput
        valor={filtro}
        aoMudar={(t) => {
          setFiltro(t);
          if (storeId) carregar(storeId, t);
        }}
        placeholder="Filtrar por descrição ou patrimônio..."
      />

      <FlatList
        style={styles.lista}
        data={fornos}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={() => storeId && carregar(storeId, filtro)}
        ListEmptyComponent={<EmptyState texto="Nenhum forno cadastrado para esta loja." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`${item.assetNumber || 's/ patrimônio'} · ${item.description}`}
            subtitulo={[item.mark, item.voltage, item.power].filter(Boolean).join(' · ')}
            detalhes={`Última manutenção: ${formatarData(item.lastMaintenance)}  ·  Próxima: ${formatarData(item.nextMaintenance)}`}
            onPress={() => router.push(`/fornos/${item.id}`)}
          />
        )}
      />

      <PrimaryButton
        titulo="+ Novo forno"
        onPress={() => router.push('/fornos/novo-forno')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipsLista: { flexGrow: 0, marginBottom: spacing.md },
  lista: { flex: 1 },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
  },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: '600' },
});
