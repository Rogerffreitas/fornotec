import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { colors, spacing, radius } from "./theme";

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: "primaria" | "secundaria" | "perigo";
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  titulo,
  onPress,
  variante = "primaria",
  carregando,
  desabilitado,
  style,
}: Props) {
  const ehPrimaria = variante === "primaria";
  const ehPerigo = variante === "perigo";
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado || carregando}
      style={({ pressed }) => [
        styles.base,
        ehPrimaria && styles.primaria,
        ehPerigo && styles.perigo,
        !ehPrimaria && !ehPerigo && styles.secundaria,
        (desabilitado || carregando) && styles.desabilitado,
        pressed && !desabilitado && !carregando && styles.pressionado,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={ehPrimaria || ehPerigo ? "#FFFFFF" : colors.primary} />
      ) : (
        <Text style={ehPrimaria || ehPerigo ? styles.textoClaro : styles.textoEscuro}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaria: { backgroundColor: colors.primary },
  perigo: { backgroundColor: colors.danger },
  secundaria: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  desabilitado: { opacity: 0.5 },
  pressionado: { opacity: 0.85 },
  textoClaro: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
  textoEscuro: { color: colors.text, fontWeight: "600", fontSize: 15 },
});
