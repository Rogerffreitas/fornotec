import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Platform, Alert, StyleSheet } from 'react-native';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ListRow } from '../../../components/ListRow';
import { EmptyState } from '../../../components/EmptyState';
import { Store } from '../../../domain/entities/Store';
import { Maintenance } from '../../../domain/entities/Maintenance';
import {
  storeUseCase,
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
  pdfGenerator,
} from '../../../infra/ioc/container';
import { MaintenanceReportOvenItem } from '../../../infra/pdf/templates/maintenanceReportPdfTemplate';
import {
  buildAnalyticStoreReportPdfDocument,
  buildSyntheticStoreReportPdfDocument,
} from '../../../infra/pdf/templates/storeMaintenanceReportPdfTemplate';
import { baixarPdfNaWeb } from '../../../infra/pdf/baixarPdfNaWeb';
import { colors, spacing } from '../../../components/theme';
import { useAuth } from '@/context/AuthContext';

type TipoRelatorio = 'analitico' | 'sintetico';

export default function Relatorios() {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<Store[]>([]);
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [gerando, setGerando] = useState<TipoRelatorio | null>(null);

  useEffect(() => {
    storeUseCase.findAll(user!.enterpriseId).then(setLojas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loja = lojas.find((l) => l.id === lojaId) ?? null;

  async function montarItens(): Promise<MaintenanceReportOvenItem[]> {
    const enterpriseId = user!.enterpriseId;
    const [fornosDaLoja, manutencoesDaLoja] = await Promise.all([
      ovenUseCase.findByStore(enterpriseId, lojaId as number),
      maintenanceUseCase.findByStore(enterpriseId, lojaId as number),
    ]);

    return Promise.all(
      fornosDaLoja.map(async (oven) => {
        const associacoes = await ovenUseCase.findPartsOfOven(enterpriseId, oven.id);
        const pecas = associacoes.length
          ? await partUseCase.findByIds(
              enterpriseId,
              associacoes.map((a) => a.partId),
            )
          : [];
        const historico: Maintenance[] = manutencoesDaLoja.filter((m) => m.ovenId === oven.id);
        return { oven, pecas, historico };
      }),
    );
  }

  async function gerar(tipo: TipoRelatorio) {
    if (!lojaId) return;
    setGerando(tipo);
    try {
      const itens = await montarItens();
      const documento =
        tipo === 'sintetico'
          ? buildSyntheticStoreReportPdfDocument({ loja, enterpriseName: user!.enterpriseName, itens })
          : buildAnalyticStoreReportPdfDocument({ loja, enterpriseName: user!.enterpriseName, itens });

      const bytes = await pdfGenerator.generate(documento);
      const sufixo = tipo === 'sintetico' ? 'sintetico' : 'analitico';
      if (Platform.OS === 'web') {
        await baixarPdfNaWeb(bytes, `relatorio-manutencao-${sufixo}-loja-${lojaId}.pdf`);
      } else {
        Alert.alert(
          'Disponível na web',
          'O download de PDF está disponível na versão web do app por enquanto.',
        );
      }
    } finally {
      setGerando(null);
    }
  }

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
