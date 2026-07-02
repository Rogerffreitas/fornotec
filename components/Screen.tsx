import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, maxContentWidth } from "./theme";

/**
 * No web (destino: deploy no Netlify), o conteúdo fica centralizado com
 * largura máxima, para não esticar demais em telas de desktop. No mobile
 * ocupa a tela toda normalmente.
 */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.centralizador}>
        <View style={styles.conteudo}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centralizador: { flex: 1, width: "100%", alignItems: Platform.OS === "web" ? "center" : "stretch" },
  conteudo: { flex: 1, width: "100%", maxWidth: Platform.OS === "web" ? maxContentWidth : undefined, padding: spacing.md },
});
