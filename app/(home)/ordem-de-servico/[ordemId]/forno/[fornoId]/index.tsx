import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../../../components/Screen';
import { TextField } from '../../../../../../components/TextField';
import { PrimaryButton } from '../../../../../../components/PrimaryButton';
import { EmptyState } from '../../../../../../components/EmptyState';
import { ServiceTypeChip } from '../../../../../../components/ServiceTypeChip';
import { FilterChip } from '../../../../../../components/FilterChip';
import { SERVICE_TYPES } from '../../../../../../domain/types';
import { colors, spacing, radius } from '../../../../../../components/theme';
import { useOrderOvenMaintenance } from './useOrderOvenMaintenance';

export default function NovaManutencao() {
  const {
    pecasDoForno,
    jaRegistradas,
    partId,
    setPartId,
    servico,
    setServico,
    observacao,
    setObservacao,
    pendentes,
    adicionarItem,
    removerPendente,
    salvando,
    erro,
    salvarTudo,
    nomePeca,
  } = useOrderOvenMaintenance();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Nova manutenção' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {jaRegistradas.length > 0 ? (
          <>
            <Text style={styles.secao}>Já registradas nesta ordem</Text>
            {jaRegistradas.map((m) => (
              <View key={m.id} style={styles.itemRegistrado}>
                <View style={styles.itemCabecalho}>
                  <Text style={styles.itemRegistradoTexto}>{nomePeca(m.partId)}</Text>
                  <ServiceTypeChip tipo={m.serviceType} />
                </View>
                {m.observation ? (
                  <Text style={styles.itemRegistradoObs}>{m.observation}</Text>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.secao}>Escolha a peça</Text>
        {pecasDoForno.length === 0 ? (
          <EmptyState texto="Este forno ainda não tem peças cadastradas. Cadastre em 'Peças do Forno'." />
        ) : (
          pecasDoForno.map((p) => {
            const selecionada = partId === p.id;
            return (
              <View key={p.id} style={styles.pecaBloco}>
                <FilterChip
                  texto={`${p.reference} · ${p.description}`}
                  selecionado={selecionada}
                  onPress={() => setPartId(selecionada ? null : p.id)}
                  style={styles.pecaChip}
                />
                {selecionada ? (
                  <View style={styles.pecaExpandida}>
                    <Text style={styles.secao}>Serviço executado</Text>
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

                    {erro ? <Text style={styles.erro}>{erro}</Text> : null}
                    <PrimaryButton
                      titulo="+ Adicionar peça à lista"
                      variante="secundaria"
                      onPress={adicionarItem}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        {pendentes.length > 0 ? (
          <>
            <Text style={[styles.secao, { marginTop: spacing.lg }]}>Pendentes para salvar</Text>
            {pendentes.map((item, index) => (
              <View key={index} style={styles.itemPendente}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemCabecalho}>
                    <Text style={styles.itemPendenteTexto}>{nomePeca(item.partId)}</Text>
                    <ServiceTypeChip tipo={item.serviceType} />
                  </View>
                  {item.observation ? (
                    <Text style={styles.itemRegistradoObs}>{item.observation}</Text>
                  ) : null}
                </View>
                <Pressable onPress={() => removerPendente(index)}>
                  <Text style={styles.remover}>Remover</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}

        {erro && partId === null ? <Text style={styles.erro}>{erro}</Text> : null}
        <PrimaryButton
          titulo="Salvar manutenção"
          onPress={salvarTudo}
          carregando={salvando}
          desabilitado={!pendentes.length}
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  secao: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  erro: { color: colors.danger, marginBottom: spacing.md },
  pecaBloco: { marginBottom: spacing.sm },
  pecaChip: { alignSelf: 'stretch' },
  pecaExpandida: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  itemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemRegistrado: {
    backgroundColor: colors.highlight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemRegistradoTexto: { fontSize: 13, color: colors.primaryDark, fontWeight: '600' },
  itemRegistradoObs: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemPendente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemPendenteTexto: { fontSize: 13, color: colors.text, fontWeight: '600' },
  remover: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
