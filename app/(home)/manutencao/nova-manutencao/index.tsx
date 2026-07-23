import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { ServiceTypeChip } from '../../../../components/ServiceTypeChip';
import { SERVICE_TYPES } from '../../../../domain/types';
import { colors, spacing, radius } from '../../../../components/theme';
import { useNewMaintenanceWizard } from './useNewMaintenanceWizard';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function NovaManutencao() {
  const {
    ordens,
    lojasPorId,
    orderId,
    setOrderId,
    fornosDaOrdem,
    ovenId,
    setOvenId,
    pecasDoForno,
    partId,
    setPartId,
    servico,
    setServico,
    observacao,
    setObservacao,
    salvando,
    erro,
    salvar,
  } = useNewMaintenanceWizard();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Nova manutenção' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.secao}>Ordem de serviço</Text>
        {ordens.length === 0 ? (
          <EmptyState texto="Nenhuma ordem de serviço em aberto." />
        ) : (
          <View style={styles.chips}>
            {ordens.map((ordem) => (
              <Pressable
                key={ordem.id}
                onPress={() => setOrderId(ordem.id)}
                style={[styles.chip, orderId === ordem.id && styles.chipSelecionado]}
              >
                <Text
                  style={[styles.chipTexto, orderId === ordem.id && styles.chipTextoSelecionado]}
                >
                  OS #{ordem.id} · {lojasPorId[ordem.storeId]?.description ?? ''} ·{' '}
                  {formatarData(ordem.createdAt)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {orderId ? (
          <>
            <Text style={styles.secao}>Forno</Text>
            {fornosDaOrdem.length === 0 ? (
              <EmptyState texto="Esta ordem não tem fornos associados." />
            ) : (
              <View style={styles.chips}>
                {fornosDaOrdem.map((forno) => (
                  <Pressable
                    key={forno.id}
                    onPress={() => setOvenId(forno.id)}
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

        {ovenId ? (
          <>
            <Text style={styles.secao}>Peça</Text>
            {pecasDoForno.length === 0 ? (
              <EmptyState texto="Este forno ainda não tem peças cadastradas. Cadastre em 'Peças do Forno'." />
            ) : (
              <View style={styles.chips}>
                {pecasDoForno.map((peca) => (
                  <Pressable
                    key={peca.id}
                    onPress={() => setPartId(peca.id)}
                    style={[styles.chip, partId === peca.id && styles.chipSelecionado]}
                  >
                    <Text
                      style={[styles.chipTexto, partId === peca.id && styles.chipTextoSelecionado]}
                    >
                      {peca.reference} · {peca.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        ) : null}

        {partId ? (
          <>
            <Text style={styles.secao}>Status</Text>
            <View style={styles.chips}>
              {SERVICE_TYPES.map((s) => (
                <ServiceTypeChip
                  key={s}
                  tipo={s}
                  selecionado={servico === s}
                  onPress={() => setServico(s)}
                />
              ))}
            </View>

            <TextField
              rotulo="Observação"
              value={observacao}
              onChangeText={setObservacao}
              placeholder="O que foi feito nesta peça"
            />
          </>
        ) : null}

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        <PrimaryButton
          titulo="Salvar manutenção"
          onPress={salvar}
          carregando={salvando}
          desabilitado={!orderId || !ovenId || !partId || !servico}
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  secao: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
  erro: { color: colors.danger, marginBottom: spacing.md },
});
