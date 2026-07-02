import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../../components/Screen";
import { TextField } from "../../../components/TextField";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Store } from "../../../domain/entities/Store";
import { storeUseCase, ovenUseCase } from "../../../infra/ioc/container";
import { OVEN_DESCRIPTION_MAX_LENGTH } from "../../../domain/entities/Oven";
import { colors, spacing, radius } from "../../../components/theme";

export default function NovoForno() {
  const [lojas, setLojas] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [assetNumber, setAssetNumber] = useState("");
  const [description, setDescription] = useState("");
  const [mark, setMark] = useState("");
  const [voltage, setVoltage] = useState("");
  const [power, setPower] = useState("");
  const [reference, setReference] = useState("");
  const [maintenanceFrequency, setMaintenanceFrequency] = useState("90");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    storeUseCase.findAll().then((resultado) => {
      setLojas(resultado);
      setStoreId(resultado[0]?.id ?? null);
    });
  }, []);

  const frequenciaNumero = Number(maintenanceFrequency);
  const valido = storeId && description.trim() && frequenciaNumero > 0;

  async function salvar() {
    if (!valido || !storeId) {
      setErro("Escolha a loja, informe a descrição e a periodicidade de manutenção.");
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await ovenUseCase.create({
        storeId,
        assetNumber: assetNumber.trim() || undefined,
        description: description.trim(),
        mark: mark.trim() || undefined,
        voltage: voltage.trim() || undefined,
        power: power.trim() || undefined,
        reference: reference.trim() || undefined,
        maintenanceFrequency: frequenciaNumero,
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.rotulo}>Loja *</Text>
        <View style={styles.chips}>
          {lojas.map((loja) => (
            <Pressable key={loja.id} onPress={() => setStoreId(loja.id)} style={[styles.chip, storeId === loja.id && styles.chipSelecionado]}>
              <Text style={[styles.chipTexto, storeId === loja.id && styles.chipTextoSelecionado]}>{loja.description}</Text>
            </Pressable>
          ))}
        </View>

        <TextField rotulo="Descrição do forno *" value={description} onChangeText={setDescription} placeholder="Forno combinado 10 GN" maxLength={OVEN_DESCRIPTION_MAX_LENGTH} />
        <TextField rotulo="Número do patrimônio" value={assetNumber} onChangeText={setAssetNumber} placeholder="PAT-0001" />
        <TextField rotulo="Marca" value={mark} onChangeText={setMark} placeholder="Rational" />
        <TextField rotulo="Tensão" value={voltage} onChangeText={setVoltage} placeholder="ex: 220V" />
        <TextField rotulo="Potência" value={power} onChangeText={setPower} placeholder="ex: 10000W" />
        <TextField rotulo="Referência" value={reference} onChangeText={setReference} placeholder="FRC-10GN" />
        <TextField
          rotulo="Periodicidade de manutenção (dias) *"
          value={maintenanceFrequency}
          onChangeText={setMaintenanceFrequency}
          keyboardType="numeric"
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        <PrimaryButton titulo="Salvar forno" onPress={salvar} carregando={salvando} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: "600" },
  erro: { color: colors.danger, marginBottom: spacing.md },
});
