import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "./theme";

interface Props {
  titulo: string;
  subtitulo?: string;
  detalhes?: string;
  badge?: { texto: string; tom: "sucesso" | "aviso" | "perigo" | "neutro" };
  onPress?: () => void;
}

const TONS: Record<NonNullable<Props["badge"]>["tom"], { bg: string; texto: string }> = {
  sucesso: { bg: "#DCFCE7", texto: "#15803D" },
  aviso: { bg: "#FEF3C7", texto: "#B45309" },
  perigo: { bg: "#FEE2E2", texto: "#B91C1C" },
  neutro: { bg: "#E5E7EB", texto: "#374151" },
};

export function ListRow({ titulo, subtitulo, detalhes, badge, onPress }: Props) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: any) => [styles.linha, pressed && onPress ? styles.pressionado : null]}
    >
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>{titulo}</Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: TONS[badge.tom].bg }]}>
            <Text style={[styles.badgeTexto, { color: TONS[badge.tom].texto }]}>{badge.texto}</Text>
          </View>
        ) : null}
      </View>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      {detalhes ? <Text style={styles.detalhes}>{detalhes}</Text> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  linha: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressionado: { opacity: 0.7 },
  cabecalho: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  titulo: { fontSize: 15, fontWeight: "600", color: colors.text, flexShrink: 1 },
  subtitulo: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detalhes: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.lg },
  badgeTexto: { fontSize: 11, fontWeight: "700" },
});
