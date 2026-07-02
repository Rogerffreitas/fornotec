import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "./theme";

export type LoginRole = "technician" | "client";

interface Props {
  valor: LoginRole;
  aoMudar: (papel: LoginRole) => void;
}

/** Checkbox/segmented control para o usuário escolher se é técnico ou cliente ao entrar. */
export function RoleToggle({ valor, aoMudar }: Props) {
  return (
    <View style={styles.container}>
      {(["technician", "client"] as LoginRole[]).map((papel) => {
        const ativo = valor === papel;
        return (
          <Pressable
            key={papel}
            onPress={() => aoMudar(papel)}
            style={[styles.opcao, ativo && styles.opcaoAtiva]}
          >
            <View style={[styles.checkbox, ativo && styles.checkboxMarcado]} />
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>
              {papel === "technician" ? "Sou técnico" : "Sou cliente"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  opcao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  opcaoAtiva: { borderColor: colors.primary, backgroundColor: colors.highlight },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 2, borderColor: colors.border },
  checkboxMarcado: { backgroundColor: colors.primary, borderColor: colors.primary },
  texto: { fontSize: 13, color: colors.text, fontWeight: "600" },
  textoAtivo: { color: colors.primaryDark },
});
