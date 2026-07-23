import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { ServiceTypeChip } from '../../../../components/ServiceTypeChip';
import { FilterChip } from '../../../../components/FilterChip';
import { SERVICE_TYPES } from '../../../../domain/types';
import { colors, spacing } from '../../../../components/theme';
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
              <FilterChip
                key={ordem.id}
                texto={`OS #${ordem.id} · ${lojasPorId[ordem.storeId]?.description ?? ''} · ${formatarData(ordem.createdAt)}`}
                selecionado={orderId === ordem.id}
                onPress={() => setOrderId(ordem.id)}
              />
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
                  <FilterChip
                    key={forno.id}
                    texto={`${forno.assetNumber || 's/ patrimônio'} · ${forno.description}`}
                    selecionado={ovenId === forno.id}
                    onPress={() => setOvenId(forno.id)}
                  />
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
                  <FilterChip
                    key={peca.id}
                    texto={`${peca.reference} · ${peca.description}`}
                    selecionado={partId === peca.id}
                    onPress={() => setPartId(peca.id)}
                  />
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
  erro: { color: colors.danger, marginBottom: spacing.md },
});
