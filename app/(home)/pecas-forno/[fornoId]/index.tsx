import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Screen } from '../../../../components/Screen';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { findLocation } from '../../../../domain/types';
import { colors, spacing, radius } from '../../../../components/theme';
import { useOvenParts } from './useOvenParts';

export default function PecasDoForno() {
  const { pecasJaLigadas, pecasDisponiveis, selecionadas, alternarSelecao, salvando, salvar } =
    useOvenParts();

  return (
    <Screen>
      <FlatList
        style={styles.lista}
        data={pecasDisponiveis}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <Text style={styles.secao}>Peças já cadastradas neste forno</Text>
            {pecasJaLigadas.length === 0 ? (
              <EmptyState texto="Nenhuma peça associada ainda." />
            ) : (
              pecasJaLigadas.map((p) => (
                <View key={p.id} style={styles.linhaLigada}>
                  <Text style={styles.linhaLigadaTexto}>
                    {p.reference} · {p.description}
                  </Text>
                </View>
              ))
            )}
            <Text style={[styles.secao, { marginTop: spacing.lg }]}>Adicionar peças</Text>
          </>
        }
        ListEmptyComponent={<EmptyState texto="Todas as peças cadastradas já estão neste forno." />}
        renderItem={({ item }) => {
          const marcada = selecionadas.includes(item.id);
          return (
            <Pressable
              onPress={() => alternarSelecao(item.id)}
              style={[styles.itemSelecionavel, marcada && styles.itemMarcado]}
            >
              <View style={[styles.checkbox, marcada && styles.checkboxMarcado]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitulo}>
                  {item.reference} · {item.description}
                </Text>
                <Text style={styles.itemSubtitulo}>{findLocation(item.location).description}</Text>
              </View>
            </Pressable>
          );
        }}
      />

      <PrimaryButton
        titulo={`Adicionar ${selecionadas.length || ''} peça(s) selecionada(s)`.trim()}
        onPress={salvar}
        carregando={salvando}
        desabilitado={!selecionadas.length}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { flex: 1 },
  secao: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  linhaLigada: {
    backgroundColor: colors.highlight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  linhaLigadaTexto: { fontSize: 13, color: colors.primaryDark },
  itemSelecionavel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemMarcado: { borderColor: colors.primary, backgroundColor: colors.highlight },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: colors.border },
  checkboxMarcado: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemTitulo: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemSubtitulo: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
