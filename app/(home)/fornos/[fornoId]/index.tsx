import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { OVEN_DESCRIPTION_MAX_LENGTH } from '../../../../domain/entities/Oven';
import { colors, spacing } from '../../../../components/theme';
import { useEditOven } from './useEditOven';

export default function EditarForno() {
  const {
    loja,
    carregado,
    naoEncontrado,
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
  } = useEditOven();

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

  if (carregado && naoEncontrado) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Forno não encontrado' }} />
        <EmptyState texto="Este forno não foi encontrado." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Editar forno' }} />
      {carregado ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {loja ? (
            <View style={styles.lojaBloco}>
              <Text style={styles.rotulo}>Loja</Text>
              <Text style={styles.lojaTexto}>{loja.description}</Text>
            </View>
          ) : null}

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
            titulo="Salvar alterações"
            onPress={salvar}
            carregando={salvando}
            style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
          />
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lojaBloco: { marginBottom: spacing.md },
  rotulo: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  lojaTexto: { fontSize: 15, color: colors.text },
  erro: { color: colors.danger, marginBottom: spacing.md },
});
