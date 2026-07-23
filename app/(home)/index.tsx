import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { colors, spacing, radius } from '../../components/theme';
import { useDashboard } from './useDashboard';

export default function Home() {
  const { userName, roleLabel, modulosVisiveis, sair } = useDashboard();

  return (
    <Screen>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.saudacao}>Olá, {userName}</Text>
          <Text style={styles.subtitulo}>{roleLabel}</Text>
        </View>
        <Pressable onPress={sair}>
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
