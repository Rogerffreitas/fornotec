import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { FilterChip } from '../../../../components/FilterChip';
import { EmptyState } from '../../../../components/EmptyState';
import { LOCATIONS } from '../../../../domain/types';
import { PART_FIELD_MAX_LENGTH } from '../../../../domain/entities/Part';
import { colors, spacing } from '../../../../components/theme';
import { useEditPart } from './useEditPart';

export default function EditarPeca() {
  const { carregado, naoEncontrado, description, setDescription, location, setLocation, salvando, erro, salvar } =
    useEditPart();

  const descriptionRef = useRef<TextInput>(null);
  const buttonRef = useRef<View>(null);

  useEffect(() => {
    if (erro) descriptionRef.current?.focus();
  }, [erro]);

  if (carregado && naoEncontrado) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Peça não encontrada' }} />
        <EmptyState texto="Esta peça não foi encontrada." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Editar peça' }} />
      {carregado ? (
        <View>
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
            titulo="Salvar alterações"
            onPress={salvar}
            carregando={salvando}
            style={{ marginTop: spacing.md }}
          />
        </View>
      ) : null}
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
