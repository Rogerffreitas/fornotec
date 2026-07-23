import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { PriorityChip } from '../../../../components/PriorityChip';
import { WORK_ORDER_PRIORITIES } from '../../../../domain/types';
import { colors, spacing, radius } from '../../../../components/theme';
import { useNewWorkOrder } from './useNewWorkOrder';

export default function NovaOrdem() {
  const {
    lojas,
    storeId,
    setStoreId,
    prioridade,
    setPrioridade,
    fornos,
    selecoes,
    alternarForno,
    mudarObservacao,
    salvando,
    erro,
    valido,
    salvar,
  } = useNewWorkOrder();

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

        <Text style={styles.rotulo}>Prioridade</Text>
        <View style={styles.chips}>
          {WORK_ORDER_PRIORITIES.map((p) => (
            <PriorityChip
              key={p}
              prioridade={p}
              selecionado={prioridade === p}
              onPress={() => setPrioridade(p)}
            />
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
          desabilitado={!valido}
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
