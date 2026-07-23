import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../components/theme';
import { Modulo, podeAcessarModulo } from '../../domain/types/permissions';

const MODULOS: { titulo: string; descricao: string; rota: string; modulo: Modulo }[] = [
  { titulo: 'Lojas', descricao: 'Cadastro de lojas', rota: '/lojas', modulo: 'lojas' },
  {
    titulo: 'Ordens de Serviço',
    descricao: 'Abrir e acompanhar ordens',
    rota: '/ordem-de-servico',
    modulo: 'ordem-de-servico',
  },
  { titulo: 'Peças', descricao: 'Cadastro de peças', rota: '/pecas', modulo: 'pecas' },
  { titulo: 'Fornos', descricao: 'Cadastro de fornos por loja', rota: '/fornos', modulo: 'fornos' },
  {
    titulo: 'Peças do Forno',
    descricao: 'Associar peças aos fornos',
    rota: '/pecas-forno',
    modulo: 'pecas-forno',
  },
  {
    titulo: 'Manutenções',
    descricao: 'Histórico de manutenções',
    rota: '/manutencao',
    modulo: 'manutencao',
  },
  {
    titulo: 'Relatórios',
    descricao: 'Relatórios analítico e sintético por loja',
    rota: '/reports',
    modulo: 'relatorios',
  },
];

export default function Home() {
  const { user, logout } = useAuth();
  const modulosVisiveis = MODULOS.filter((m) => podeAcessarModulo(user!.role, m.modulo));

  return (
    <Screen>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.saudacao}>Olá, {user?.name ?? ''}</Text>
          <Text style={styles.subtitulo}>
            {user?.role === 'TECHNICAL'
              ? 'Perfil: técnico'
              : user?.role === 'CLIENT'
                ? 'Perfil: cliente'
                : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            logout();
            router.replace('/login');
          }}
        >
          <Text style={styles.sair}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.grade}>
        {modulosVisiveis.map((m) => (
          <Pressable
            key={m.rota}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressionado]}
            onPress={() => router.push(m.rota as any)}
          >
            <Text style={styles.cardTitulo}>{m.titulo}</Text>
            <Text style={styles.cardDescricao}>{m.descricao}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  saudacao: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitulo: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sair: { color: colors.primary, fontWeight: '600' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 92,
  },
  cardPressionado: { opacity: 0.8 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardDescricao: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
});
