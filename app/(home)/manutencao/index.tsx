import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../components/Screen';
import { FilterInput } from '../../../components/FilterInput';
import { ListRow } from '../../../components/ListRow';
import { ServiceTypeChip } from '../../../components/ServiceTypeChip';
import { EmptyState } from '../../../components/EmptyState';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Maintenance } from '../../../domain/entities/Maintenance';
import { Part } from '../../../domain/entities/Part';
import { Oven } from '../../../domain/entities/Oven';
import { maintenanceUseCase, partUseCase, ovenUseCase } from '../../../infra/ioc/container';
import { spacing } from '../../../components/theme';
import { useAuth } from '@/context/AuthContext';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Manutencoes() {
  const { user } = useAuth();
  const [manutencoes, setManutencoes] = useState<Maintenance[]>([]);
  const [pecasPorId, setPecasPorId] = useState<Record<number, Part>>({});
  const [fornosPorId, setFornosPorId] = useState<Record<number, Oven>>({});
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const enterpriseId = user!.enterpriseId;
    const [lista, pecas, fornos] = await Promise.all([
      maintenanceUseCase.findAll(enterpriseId),
      partUseCase.findAll(enterpriseId),
      ovenUseCase.findAll(enterpriseId),
    ]);
    setManutencoes(lista);
    setPecasPorId(Object.fromEntries(pecas.map((p) => [p.id, p])));
    setFornosPorId(Object.fromEntries(fornos.map((f) => [f.id, f])));
    setCarregando(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const alvo = filtro.trim().toLowerCase();
  const filtradas = alvo
    ? manutencoes.filter((m) => {
        const peca = pecasPorId[m.partId];
        const forno = fornosPorId[m.ovenId];
        return (
          peca?.description.toLowerCase().includes(alvo) ||
          forno?.description.toLowerCase().includes(alvo) ||
          m.observation.toLowerCase().includes(alvo)
        );
      })
    : manutencoes;

  return (
    <Screen>
      <FilterInput
        valor={filtro}
        aoMudar={setFiltro}
        placeholder="Filtrar por peça, forno ou observação..."
      />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregar}
        ListEmptyComponent={<EmptyState texto="Nenhuma manutenção registrada ainda." />}
        renderItem={({ item }) => (
          <ListRow
            titulo={`OS #${item.orderId} · ${fornosPorId[item.ovenId]?.description ?? 'Forno'} · ${pecasPorId[item.partId]?.description ?? 'Peça'}`}
            subtitulo={formatarData(item.maintenanceDate)}
            detalhes={item.observation}
            badgeNode={<ServiceTypeChip tipo={item.serviceType} />}
          />
        )}
      />
      <PrimaryButton
        titulo="+ Nova manutenção"
        onPress={() => router.push('/manutencao/nova-manutencao')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
