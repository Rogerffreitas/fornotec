import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../../../../components/Screen';
import { TextField } from '../../../../../../components/TextField';
import { PrimaryButton } from '../../../../../../components/PrimaryButton';
import { EmptyState } from '../../../../../../components/EmptyState';
import { ServiceTypeChip } from '../../../../../../components/ServiceTypeChip';
import { Part } from '../../../../../../domain/entities/Part';
import { Maintenance, NewMaintenanceItem } from '../../../../../../domain/entities/Maintenance';
import { SERVICE_TYPES, ServiceType } from '../../../../../../domain/types';
import {
  ovenUseCase,
  partUseCase,
  maintenanceUseCase,
} from '../../../../../../infra/ioc/container';
import { colors, spacing, radius } from '../../../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

export default function NovaManutencao() {
  const { user } = useAuth();
  const { ordemId, fornoId } = useLocalSearchParams<{ ordemId: string; fornoId: string }>();
  const orderId = Number(ordemId);
  const ovenId = Number(fornoId);

  const [pecasDoForno, setPecasDoForno] = useState<Part[]>([]);
  const [jaRegistradas, setJaRegistradas] = useState<Maintenance[]>([]);

  const [partId, setPartId] = useState<number | null>(null);
  const [servico, setServico] = useState<ServiceType | null>(null);
  const [observacao, setObservacao] = useState('');
  const [pendentes, setPendentes] = useState<NewMaintenanceItem[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const enterpriseId = user!.enterpriseId;
    const associacoes = await ovenUseCase.findPartsOfOven(enterpriseId, ovenId);
    const [pecas, registradas] = await Promise.all([
      partUseCase.findByIds(
        enterpriseId,
        associacoes.map((a) => a.partId),
      ),
      maintenanceUseCase.findByOrderAndOven(enterpriseId, orderId, ovenId),
    ]);
    setPecasDoForno(pecas);
    setJaRegistradas(registradas);
  }, [ovenId, orderId, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function adicionarItem() {
    if (!partId || !servico) {
      setErro('Escolha a peça e o tipo de serviço.');
      return;
    }
    setErro(null);
    setPendentes((atual) => [...atual, { partId, serviceType: servico, observation: observacao }]);
    setPartId(null);
    setServico(null);
    setObservacao('');
  }

  function removerPendente(index: number) {
    setPendentes((atual) => atual.filter((_, i) => i !== index));
  }

  async function salvarTudo() {
    if (!pendentes.length) {
      setErro('Adicione ao menos uma peça antes de salvar.');
      return;
    }
    setSalvando(true);
    try {
      await maintenanceUseCase.register(user!.enterpriseId, orderId, ovenId, pendentes);
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  function nomePeca(id: number): string {
    const peca = pecasDoForno.find((p) => p.id === id);
    return peca ? `${peca.reference} · ${peca.description}` : `Peça ${id}`;
  }

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
          <View style={styles.chips}>
            {pecasDoForno.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setPartId(p.id)}
                style={[styles.chip, partId === p.id && styles.chipSelecionado]}
              >
                <Text style={[styles.chipTexto, partId === p.id && styles.chipTextoSelecionado]}>
                  {p.reference} · {p.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

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
