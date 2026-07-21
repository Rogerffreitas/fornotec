import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { Store } from '../../../../domain/entities/Store';
import { OVEN_DESCRIPTION_MAX_LENGTH } from '../../../../domain/entities/Oven';
import { storeUseCase, ovenUseCase } from '../../../../infra/ioc/container';
import { colors, spacing } from '../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

export default function EditarForno() {
  const { user } = useAuth();
  const { fornoId } = useLocalSearchParams<{ fornoId: string }>();
  const id = Number(fornoId);

  const [loja, setLoja] = useState<Store | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [assetNumber, setAssetNumber] = useState('');
  const [description, setDescription] = useState('');
  const [mark, setMark] = useState('');
  const [voltage, setVoltage] = useState('');
  const [power, setPower] = useState('');
  const [reference, setReference] = useState('');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const enterpriseId = user!.enterpriseId;
    const forno = await ovenUseCase.findById(enterpriseId, id);
    if (!forno) {
      setNaoEncontrado(true);
      setCarregado(true);
      return;
    }
    setLoja((await storeUseCase.findById(enterpriseId, forno.storeId)) ?? null);
    setAssetNumber(forno.assetNumber ?? '');
    setDescription(forno.description);
    setMark(forno.mark ?? '');
    setVoltage(forno.voltage ?? '');
    setPower(forno.power ?? '');
    setReference(forno.reference ?? '');
    setMaintenanceFrequency(String(forno.maintenanceFrequency));
    setCarregado(true);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const frequenciaNumero = Number(maintenanceFrequency);
  const valido = description.trim() && frequenciaNumero > 0;

  async function salvar() {
    if (!valido) {
      setErro('Informe a descrição e a periodicidade de manutenção.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await ovenUseCase.update(user!.enterpriseId, id, {
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
            rotulo="Descrição do forno *"
            value={description}
            onChangeText={setDescription}
            placeholder="Forno combinado 10 GN"
            maxLength={OVEN_DESCRIPTION_MAX_LENGTH}
          />
          <TextField
            rotulo="Número do patrimônio"
            value={assetNumber}
            onChangeText={setAssetNumber}
            placeholder="PAT-0001"
          />
          <TextField rotulo="Marca" value={mark} onChangeText={setMark} placeholder="Rational" />
          <TextField
            rotulo="Tensão"
            value={voltage}
            onChangeText={setVoltage}
            placeholder="ex: 220V"
          />
          <TextField
            rotulo="Potência"
            value={power}
            onChangeText={setPower}
            placeholder="ex: 10000W"
          />
          <TextField
            rotulo="Referência"
            value={reference}
            onChangeText={setReference}
            placeholder="FRC-10GN"
          />
          <TextField
            rotulo="Periodicidade de manutenção (dias) *"
            value={maintenanceFrequency}
            onChangeText={setMaintenanceFrequency}
            keyboardType="numeric"
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          <PrimaryButton
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
