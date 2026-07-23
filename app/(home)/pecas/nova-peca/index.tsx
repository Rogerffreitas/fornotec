import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { FilterChip } from '../../../../components/FilterChip';
import { LOCATIONS } from '../../../../domain/types';
import { PART_FIELD_MAX_LENGTH } from '../../../../domain/entities/Part';
import { colors, spacing } from '../../../../components/theme';
import { useNewPart } from './useNewPart';

export default function NovaPeca() {
  const { description, setDescription, location, setLocation, salvando, erro, salvar } =
    useNewPart();

  const descriptionRef = useRef<TextInput>(null);
  const buttonRef = useRef<View>(null);

  useEffect(() => {
    if (erro) descriptionRef.current?.focus();
  }, [erro]);

  return (
    <Screen>
      <TextField
        ref={descriptionRef}
        rotulo="Descrição *"
        value={description}
        onChangeText={setDescription}
        placeholder="Resistência blindada"
        maxLength={PART_FIELD_MAX_LENGTH}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => buttonRef.current?.focus()}
      />

      <Text style={styles.rotulo}>Localização *</Text>
      <View style={styles.chips}>
        {LOCATIONS.map((loc) => (
          <FilterChip
            key={loc.ref}
            texto={loc.description}
            selecionado={location === loc.ref}
            onPress={() => setLocation(loc.ref)}
          />
        ))}
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      <PrimaryButton
        ref={buttonRef}
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
  erro: { color: colors.danger, marginBottom: spacing.md },
});
