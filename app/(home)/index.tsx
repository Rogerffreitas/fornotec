import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Screen } from '../../components/Screen';
import { Badge } from '../../components/ListRow';
import { colors, spacing, radius } from '../../components/theme';
import { useDashboard } from './useDashboard';

export default function Home() {
  const { saudacao, userName, roleBadge, modulosVisiveis, sair } = useDashboard();

  return (
    <Screen
      cabecalho={
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.saudacao}>
              {saudacao}, <Text style={styles.nome}>{userName}</Text>
            </Text>
            {roleBadge ? (
              <View style={styles.badgeWrapper}>
                <Badge texto={roleBadge.texto} tom={roleBadge.tom} />
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={sair}
            style={({ pressed }) => [styles.sairBotao, pressed && styles.sairBotaoPressionado]}
          >
            <Text style={styles.sair}>Sair</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.grade}>
        {modulosVisiveis.map((m) => (
          <Pressable
            key={m.rota}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressionado]}
            onPress={() => router.push(m.rota as any)}
          >
            <View style={styles.iconeWrapper}>
              <FontAwesome name={m.icone} size={18} color={colors.primary} />
            </View>
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
    backgroundColor: colors.brand,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  saudacao: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  nome: { color: colors.primary },
  badgeWrapper: { marginTop: spacing.xs, alignSelf: 'flex-start' },
  sairBotao: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.card,
    backgroundColor: colors.card,
  },
  sairBotaoPressionado: { opacity: 0.7 },
  sair: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressionado: { opacity: 0.8, shadowOpacity: 0.04, elevation: 1 },
  iconeWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardDescricao: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
});
