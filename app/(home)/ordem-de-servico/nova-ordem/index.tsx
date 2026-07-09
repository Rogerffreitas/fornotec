import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { Store } from '../../../../domain/entities/Store';
import { Oven } from '../../../../domain/entities/Oven';
import { storeUseCase, ovenUseCase, workOrderUseCase } from '../../../../infra/ioc/container';
import { colors, spacing, radius } from '../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

interface SelecaoForno {
  selecionado: boolean;
  observacao: string;
}

export default function NovaOrdem() {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [selecoes, setSelecoes] = useState<Record<number, SelecaoForno>>({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then((resultado) => {
      setLojas(resultado);
      setStoreId(resultado[0]?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!storeId) return;
    ovenUseCase.findByStore(user!.enterpriseId, storeId).then((resultado) => {
      setFornos(resultado);
      setSelecoes({});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  function alternarForno(ovenId: number) {
    setSelecoes((atual) => {
      const anterior = atual[ovenId];
      return {
        ...atual,
        [ovenId]: { selecionado: !anterior?.selecionado, observacao: anterior?.observacao ?? '' },
      };
    });
  }

  function mudarObservacao(ovenId: number, texto: string) {
    setSelecoes((atual) => ({ ...atual, [ovenId]: { ...atual[ovenId], observacao: texto } }));
  }

  const fornosSelecionados = Object.entries(selecoes)
    .filter(([, v]) => v.selecionado)
    .map(([ovenId, v]) => ({ ovenId: Number(ovenId), observation: v.observacao }));

  async function salvar() {
    if (!storeId || !fornosSelecionados.length) {
      setErro('Escolha a loja e ao menos um forno para a ordem.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const { order } = await workOrderUseCase.create(
        user!.enterpriseId,
        { storeId },
        fornosSelecionados,
      );
      router.replace(`/ordem-de-servico/${order.id}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.rotulo}>Loja</Text>
        <View style={styles.chips}>
          {lojas.map((loja) => (
            <Pressable
              key={loja.id}
              onPress={() => setStoreId(loja.id)}
              style={[styles.chip, storeId === loja.id && styles.chipSelecionado]}
            >
              <Text style={[styles.chipTexto, storeId === loja.id && styles.chipTextoSelecionado]}>
                {loja.description}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.rotulo}>Fornos atendidos por esta ordem</Text>
        {fornos.length === 0 ? (
          <EmptyState texto="Esta loja ainda não tem fornos cadastrados." />
        ) : (
          fornos.map((forno) => {
            const sel = selecoes[forno.id];
            return (
              <View
                key={forno.id}
                style={[styles.fornoCard, sel?.selecionado && styles.fornoCardSelecionado]}
              >
                <Pressable style={styles.fornoCabecalho} onPress={() => alternarForno(forno.id)}>
                  <View style={[styles.checkbox, sel?.selecionado && styles.checkboxMarcado]} />
                  <Text style={styles.fornoTitulo}>
                    {forno.assetNumber || 's/ patrimônio'} · {forno.description}
                  </Text>
                </Pressable>
                {sel?.selecionado ? (
                  <TextField
                    rotulo="Observação"
                    value={sel.observacao}
                    onChangeText={(t) => mudarObservacao(forno.id, t)}
                    placeholder="Ex: forno está com problema no aquecimento"
                  />
                ) : null}
              </View>
            );
          })
        )}

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        <PrimaryButton
          titulo="Criar ordem de serviço"
          onPress={salvar}
          carregando={salvando}
          style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
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
  fornoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  fornoCardSelecionado: { borderColor: colors.primary },
  fornoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: colors.border },
  checkboxMarcado: { backgroundColor: colors.primary, borderColor: colors.primary },
  fornoTitulo: { fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1 },
  erro: { color: colors.danger, marginBottom: spacing.md },
});
