import React from 'react';
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';


export default function Home() {
  const { user } = useAuth();

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
        <Stack.Screen name="manutencao/index" options={{ title: 'Manutenção' }} />
        <Stack.Screen name="ordem-de-servico/index" options={{ title: 'Ordem de Serviço' }} />
        <Stack.Screen name="pecas/index" options={{ title: 'Peças' }} />
        <Stack.Screen name="pecas-forno/index" options={{ title: 'Peças do forno' }} />
        <Stack.Screen name="pecas-forno/[fornoId]/index" options={{ title: 'Peças do forno' }} />
        <Stack.Screen name="pecas/nova-peca/index" options={{ title: 'Cadastrar peça' }} />
        <Stack.Screen name="ordem-de-servico/nova-ordem/index" options={{ title: 'Cadastrar nova OS' }} />
      </Stack>
    </View>
  );
}
