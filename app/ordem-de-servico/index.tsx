import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { ListRow } from "../../components/ListRow";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { WorkOrder } from "../../domain/entities/WorkOrder";
import { Store } from "../../domain/entities/Store";
import { workOrderUseCase, storeUseCase } from "../../infra/ioc/container";
import { colors, spacing, radius } from "../../components/theme";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function badgeDoStatus(status: WorkOrder["status"]) {
  if (status === "finalizada") return { texto: "Finalizada", tom: "sucesso" as const };
  if (status === "cancelada") return { texto: "Cancelada", tom: "perigo" as const };
  return { texto: "Pendente", tom: "aviso" as const };
}

export default function OrdensDeServico() {
  const [lojas, setLojas] = useState<Store[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState<number | null>(null);
  const [ordens, setOrdens] = useState<WorkOrder[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    storeUseCase.findAll().then(setLojas);
  }, []);

  const carregar = useCallback(async (storeId: number | null) => {
    setCarregando(true);
    setOrdens(await workOrderUseCase.findWithFilter(storeId ?? undefined));
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar(lojaFiltro);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lojaFiltro])
  );

  const lojasPorId = Object.fromEntries(lojas.map((l) => [l.id, l]));

  return (
    <Screen>
      <Text style={styles.rotulo}>Filtrar por loja</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsLista}
        data={[{ id: -1, description: "Todas" } as Store, ...lojas]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const ativo = item.id === -1 ? lojaFiltro === null : lojaFiltro === item.id;
          return (
            <Pressable onPress={() => setLojaFiltro(item.id === -1 ? null : item.id)} style={[styles.chip, ativo && styles.chipSelecionado]}>
              <Text style={[styles.chipTexto, ativo && styles.chipTextoSelecionado]}>{item.description}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={ordens}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={() => carregar(lojaFiltro)}
        ListEmptyComponent={<EmptyState texto="Nenhuma ordem de serviço encontrada." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`OS #${item.id} · ${lojasPorId[item.storeId]?.description ?? ""}`}
            subtitulo={lojasPorId[item.storeId]?.address}
            detalhes={formatarData(item.createdAt)}
            badge={badgeDoStatus(item.status)}
            onPress={() => router.push(`/ordem-de-servico/${item.id}`)}
          />
        )}
      />

      <PrimaryButton titulo="+ Nova ordem de serviço" onPress={() => router.push("/ordem-de-servico/nova-ordem")} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: spacing.xs },
  chipsLista: { marginBottom: spacing.md },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: spacing.sm },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: "600" },
});
