import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { FilterInput } from "../../components/FilterInput";
import { ListRow } from "../../components/ListRow";
import { EmptyState } from "../../components/EmptyState";
import { Oven } from "../../domain/entities/Oven";
import { Store } from "../../domain/entities/Store";
import { ovenUseCase, storeUseCase } from "../../infra/ioc/container";

export default function PecasForno() {
  const [fornos, setFornos] = useState<Oven[]>([]);
  const [lojasPorId, setLojasPorId] = useState<Record<number, Store>>({});
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [listaFornos, listaLojas] = await Promise.all([ovenUseCase.findAll(), storeUseCase.findAll()]);
    setFornos(listaFornos);
    setLojasPorId(Object.fromEntries(listaLojas.map((l) => [l.id, l])));
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const fornosFiltrados = filtro.trim()
    ? fornos.filter((f) => f.description.toLowerCase().includes(filtro.trim().toLowerCase()))
    : fornos;

  return (
    <Screen>
      <FilterInput valor={filtro} aoMudar={setFiltro} placeholder="Filtrar por descrição do forno..." />
      <FlatList
        data={fornosFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        ListEmptyComponent={<EmptyState texto="Nenhum forno cadastrado ainda." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`${item.assetNumber || "s/ patrimônio"} · ${item.description}`}
            subtitulo={lojasPorId[item.storeId]?.description ?? ""}
            detalhes="Toque para gerenciar as peças deste forno"
            onPress={() => router.push(`/pecas-forno/${item.id}`)}
          />
        )}
      />
    </Screen>
  );
}
