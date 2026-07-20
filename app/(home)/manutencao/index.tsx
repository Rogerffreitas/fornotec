import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { ServiceTypeChip } from '../../../components/ServiceTypeChip';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Maintenance } from '../../../domain/entities/Maintenance';
import { Part } from '../../../domain/entities/Part';
import { Oven } from '../../../domain/entities/Oven';
import { Store } from '../../../domain/entities/Store';
import { maintenanceUseCase, partUseCase, ovenUseCase, storeUseCase } from '../../../infra/ioc/container';
import { colors, spacing, radius } from '../../../components/theme';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Manutencoes() {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [pecasPorId, setPecasPorId] = useState<Record<number, Part>>({});

  const [storeId, setStoreId] = useState<number | null>(null);
  const [ovenId, setOvenId] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);

  const [manutencoes, setManutencoes] = useState<Maintenance[]>([]);
  const [total, setTotal] = useState(0);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const enterpriseId = user!.enterpriseId;
    Promise.all([
      storeUseCase.findAll(enterpriseId),
      ovenUseCase.findAll(enterpriseId),
      partUseCase.findAll(enterpriseId),
    ]).then(([listaLojas, listaFornos, listaPecas]) => {
      setLojas(listaLojas);
      setFornos(listaFornos);
      setPecasPorId(Object.fromEntries(listaPecas.map((p) => [p.id, p])));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarPagina = useCallback(async () => {
    setCarregando(true);
    const enterpriseId = user!.enterpriseId;
    const resultado = await maintenanceUseCase.findPage(enterpriseId, {
      storeId: storeId ?? undefined,
      ovenId: ovenId ?? undefined,
      page: pagina,
      pageSize: PAGE_SIZE,
    });
    setManutencoes(resultado.items);
    setTotal(resultado.total);
    setCarregando(false);
  }, [user, storeId, ovenId, pagina]);

  useFocusEffect(
    useCallback(() => {
      carregarPagina();
    }, [carregarPagina]),
  );

  function selecionarLoja(id: number | null) {
    setStoreId(id);
    setOvenId(null);
    setPagina(1);
  }

  function selecionarForno(id: number | null) {
    setOvenId(id);
    setPagina(1);
  }

  const fornosDaLoja = storeId ? fornos.filter((f) => f.storeId === storeId) : [];
  const fornosPorId = Object.fromEntries(fornos.map((f) => [f.id, f]));

  const alvo = filtro.trim().toLowerCase();
  const filtradas = alvo
    ? manutencoes.filter((m) => {
        const peca = pecasPorId[m.partId];
        const forno = fornosPorId[m.ovenId];
        return (
          peca?.description.toLowerCase().includes(alvo) ||
          forno?.description.toLowerCase().includes(alvo) ||
          m.observation.toLowerCase().includes(alvo)
        );
      })
    : manutencoes;

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Screen>
      <Text style={styles.secao}>Loja</Text>
      <View style={styles.chips}>
        <Pressable
          onPress={() => selecionarLoja(null)}
          style={[styles.chip, storeId === null && styles.chipSelecionado]}
        >
          <Text style={[styles.chipTexto, storeId === null && styles.chipTextoSelecionado]}>
            Todas
          </Text>
        </Pressable>
        {lojas.map((loja) => (
          <Pressable
            key={loja.id}
            onPress={() => selecionarLoja(loja.id)}
            style={[styles.chip, storeId === loja.id && styles.chipSelecionado]}
          >
            <Text style={[styles.chipTexto, storeId === loja.id && styles.chipTextoSelecionado]}>
              {loja.description}
            </Text>
          </Pressable>
        ))}
      </View>

      {storeId ? (
        <>
          <Text style={styles.secao}>Forno</Text>
          {fornosDaLoja.length === 0 ? (
            <EmptyState texto="Esta loja não tem fornos cadastrados." />
          ) : (
            <View style={styles.chips}>
              <Pressable
                onPress={() => selecionarForno(null)}
                style={[styles.chip, ovenId === null && styles.chipSelecionado]}
              >
                <Text style={[styles.chipTexto, ovenId === null && styles.chipTextoSelecionado]}>
                  Todos
                </Text>
              </Pressable>
              {fornosDaLoja.map((forno) => (
                <Pressable
                  key={forno.id}
                  onPress={() => selecionarForno(forno.id)}
                  style={[styles.chip, ovenId === forno.id && styles.chipSelecionado]}
                >
                  <Text
                    style={[styles.chipTexto, ovenId === forno.id && styles.chipTextoSelecionado]}
                  >
                    {forno.assetNumber || 's/ patrimônio'} · {forno.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : null}

      <FilterInput
        valor={filtro}
        aoMudar={setFiltro}
        placeholder="Filtrar por peça, forno ou observação..."
      />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregarPagina}
        ListEmptyComponent={<EmptyState texto="Nenhuma manutenção encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`OS #${item.orderId} · ${fornosPorId[item.ovenId]?.description ?? 'Forno'} · ${pecasPorId[item.partId]?.description ?? 'Peça'}`}
            subtitulo={formatarData(item.maintenanceDate)}
            detalhes={item.observation}
            badgeNode={<ServiceTypeChip tipo={item.serviceType} />}
          />
        )}
      />

      {total > 0 ? (
        <View style={styles.paginacao}>
          <Pressable
            onPress={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina <= 1}
            style={[styles.paginaBotao, pagina <= 1 && styles.paginaBotaoDesabilitado]}
          >
            <Text style={styles.paginaBotaoTexto}>Anterior</Text>
          </Pressable>
          <Text style={styles.paginaInfo}>
            Página {pagina} de {totalPaginas}
          </Text>
          <Pressable
            onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina >= totalPaginas}
            style={[styles.paginaBotao, pagina >= totalPaginas && styles.paginaBotaoDesabilitado]}
          >
            <Text style={styles.paginaBotaoTexto}>Próxima</Text>
          </Pressable>
        </View>
      ) : null}

      <PrimaryButton
        titulo="+ Nova manutenção"
        onPress={() => router.push('/manutencao/nova-manutencao')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  secao: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: '600' },
  paginacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  paginaBotao: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  paginaBotaoDesabilitado: { opacity: 0.4 },
  paginaBotaoTexto: { fontSize: 13, fontWeight: '600', color: colors.text },
  paginaInfo: { fontSize: 13, color: colors.textSecondary },
});
