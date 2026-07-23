import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Badge } from '../../components/ListRow';
import { colors, spacing, radius } from '../../components/theme';
import { useDashboard } from './useDashboard';

export default function Home() {
  const { saudacao, userName, roleBadge, modulosVisiveis, sair } = useDashboard();

  return (
    <Screen>
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
  nome: { color: colors.primary },
  badgeWrapper: { marginTop: spacing.xs, alignSelf: 'flex-start' },
  sairBotao: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  },
  cardPressionado: { opacity: 0.8 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardDescricao: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
});
