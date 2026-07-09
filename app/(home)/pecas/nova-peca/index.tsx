import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { LOCATIONS, LocationRef } from '../../../../domain/types';
import { partUseCase } from '../../../../infra/ioc/container';
import { PART_FIELD_MAX_LENGTH } from '../../../../domain/entities/Part';
import { colors, spacing, radius } from '../../../../components/theme';

export default function NovaPeca() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationRef | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    if (!description.trim() || !location) {
      setErro('Preencha a descrição e escolha a localização.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await partUseCase.create({ description: description.trim(), location });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <TextField
        rotulo="Descrição *"
        value={description}
        onChangeText={setDescription}
        placeholder="Resistência blindada"
        maxLength={PART_FIELD_MAX_LENGTH}
      />

      <Text style={styles.rotulo}>Localização *</Text>
      <View style={styles.chips}>
        {LOCATIONS.map((loc) => (
          <Pressable
            key={loc.ref}
            onPress={() => setLocation(loc.ref)}
            style={[styles.chip, location === loc.ref && styles.chipSelecionado]}
          >
            <Text style={[styles.chipTexto, location === loc.ref && styles.chipTextoSelecionado]}>
              {loc.description}
            </Text>
          </Pressable>
        ))}
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <PrimaryButton
        titulo="Salvar peça"
        onPress={salvar}
        carregando={salvando}
        style={{ marginTop: spacing.md }}
      />
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
