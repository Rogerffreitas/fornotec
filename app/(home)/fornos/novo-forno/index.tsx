import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { OVEN_DESCRIPTION_MAX_LENGTH } from '../../../../domain/entities/Oven';
import { colors, spacing, radius } from '../../../../components/theme';
import { useNewOven } from './useNewOven';

export default function NovoForno() {
  const {
    lojas,
    storeId,
    setStoreId,
    assetNumber,
    setAssetNumber,
    description,
    setDescription,
    mark,
    setMark,
    voltage,
    setVoltage,
    power,
    setPower,
    reference,
    setReference,
    maintenanceFrequency,
    setMaintenanceFrequency,
    salvando,
    erro,
    salvar,
  } = useNewOven();

  const descriptionRef = useRef<TextInput>(null);
  const assetNumberRef = useRef<TextInput>(null);
  const markRef = useRef<TextInput>(null);
  const voltageRef = useRef<TextInput>(null);
  const powerRef = useRef<TextInput>(null);
  const referenceRef = useRef<TextInput>(null);
  const maintenanceFrequencyRef = useRef<TextInput>(null);
  const buttonRef = useRef<View>(null);

  useEffect(() => {
    if (erro) descriptionRef.current?.focus();
  }, [erro]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.rotulo}>Loja *</Text>
        <View style={styles.chips}>
          {lojas.map((loja) => (
            <Pressable
              key={loja.id}
              onPress={() => setStoreId(loja.id)}
              style={[styles.chip, storeId === loja.id && styles.chipSelecionado]}
            >
              <Text style={[styles.chipTexto, storeId === loja.id && styles.chipTextoSelecionado]}>
                {loja.description}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextField
          ref={descriptionRef}
          rotulo="Descrição do forno *"
          value={description}
          onChangeText={setDescription}
          placeholder="Forno combinado 10 GN"
          maxLength={OVEN_DESCRIPTION_MAX_LENGTH}
          autoFocus
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => assetNumberRef.current?.focus()}
        />
        <TextField
          ref={assetNumberRef}
          rotulo="Número do patrimônio"
          value={assetNumber}
          onChangeText={setAssetNumber}
          placeholder="PAT-0001"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => markRef.current?.focus()}
        />
        <TextField
          ref={markRef}
          rotulo="Marca"
          value={mark}
          onChangeText={setMark}
          placeholder="Rational"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => voltageRef.current?.focus()}
        />
        <TextField
          ref={voltageRef}
          rotulo="Tensão"
          value={voltage}
          onChangeText={setVoltage}
          placeholder="ex: 220V"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => powerRef.current?.focus()}
        />
        <TextField
          ref={powerRef}
          rotulo="Potência"
          value={power}
          onChangeText={setPower}
          placeholder="ex: 10000W"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => referenceRef.current?.focus()}
        />
        <TextField
          ref={referenceRef}
          rotulo="Referência"
          value={reference}
          onChangeText={setReference}
          placeholder="FRC-10GN"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => maintenanceFrequencyRef.current?.focus()}
        />
        <TextField
          ref={maintenanceFrequencyRef}
          rotulo="Periodicidade de manutenção (dias) *"
          value={maintenanceFrequency}
          onChangeText={setMaintenanceFrequency}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={() => buttonRef.current?.focus()}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        <PrimaryButton
          ref={buttonRef}
          titulo="Salvar forno"
          onPress={salvar}
          carregando={salvando}
          style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelecionado: { backgroundColor: colors.highlight, borderColor: colors.primary },
  chipTexto: { fontSize: 13, color: colors.text },
  chipTextoSelecionado: { color: colors.primaryDark, fontWeight: '600' },
  erro: { color: colors.danger, marginBottom: spacing.md },
});
