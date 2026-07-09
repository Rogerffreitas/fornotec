import React from 'react';
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const MODULOS: { titulo: string; descricao: string; rota: string }[] = [
  { titulo: 'Lojas', descricao: 'Cadastro de lojas', rota: '/lojas' },
  {
    titulo: 'Ordens de Serviço',
    descricao: 'Abrir e acompanhar ordens',
    rota: '/ordem-de-servico',
  },
  { titulo: 'Peças', descricao: 'Cadastro de peças', rota: '/pecas' },
  { titulo: 'Fornos', descricao: 'Cadastro de fornos por loja', rota: '/fornos' },
  { titulo: 'Peças do Forno', descricao: 'Associar peças aos fornos', rota: '/pecas-forno' },
  { titulo: 'Manutenções', descricao: 'Histórico de manutenções', rota: '/manutencao' },
];

export default function Home() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="fornos/index" options={{ title: 'Fornos' }} />
        <Stack.Screen name="fornos/novo-forno/index" options={{ title: 'Cadastrar Forno' }} />
        <Stack.Screen name="lojas/index" options={{ title: 'Lojas' }} />
        <Stack.Screen name="manutencao/index" options={{ title: 'Manuteção' }} />
        <Stack.Screen name="ordem-de-servico/index" options={{ title: 'Ordem de serviço' }} />
        <Stack.Screen name="peca/index" options={{ title: 'Peças' }} />
        <Stack.Screen name="peca-forno/index" options={{ title: 'Peças do forno' }} />
      </Stack>
    </View>
  );
}
