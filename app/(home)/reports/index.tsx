import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { colors, spacing } from '../../../components/theme';
import { useStoreReports } from './useStoreReports';

export default function Relatorios() {
  const { lojas, lojaId, setLojaId, gerando, gerar } = useStoreReports();

  return (
    <Screen>
      <Text style={styles.secao}>Loja</Text>
      <FlatList
        style={styles.lista}
        data={lojas}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState texto="Nenhuma loja cadastrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={item.description}
            subtitulo={item.address}
            badge={lojaId === item.id ? { texto: 'Selecionada', tom: 'sucesso' } : undefined}
            onPress={() => setLojaId(item.id)}
          />
        )}
      />

      {lojaId ? (
        <View style={styles.botoes}>
          <PrimaryButton
            titulo="Relatório Analítico"
            variante="secundaria"
            onPress={() => gerar('analitico')}
            carregando={gerando === 'analitico'}
            desabilitado={gerando !== null && gerando !== 'analitico'}
          />
          <PrimaryButton
            titulo="Relatório Sintético"
            variante="secundaria"
            onPress={() => gerar('sintetico')}
            carregando={gerando === 'sintetico'}
            desabilitado={gerando !== null && gerando !== 'sintetico'}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  secao: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  lista: { flex: 1 },
  botoes: { marginTop: spacing.md },
});
