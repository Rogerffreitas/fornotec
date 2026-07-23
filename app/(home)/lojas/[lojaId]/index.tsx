import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { STORE_FIELD_MAX_LENGTH } from '../../../../domain/entities/Store';
import { colors, spacing } from '../../../../components/theme';
import { useEditStore } from './useEditStore';

export default function EditarLoja() {
  const {
    carregado,
    naoEncontrada,
    description,
    setDescription,
    address,
    setAddress,
    contactName,
    setContactName,
    contactNumber,
    setContactNumber,
    email,
    setEmail,
    salvando,
    erro,
    salvar,
  } = useEditStore();

  if (carregado && naoEncontrada) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Loja não encontrada' }} />
        <EmptyState texto="Esta loja não foi encontrada." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Editar loja' }} />
      {carregado ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextField
            rotulo="Descrição *"
            value={description}
            onChangeText={setDescription}
            placeholder="Loja Centro"
            maxLength={STORE_FIELD_MAX_LENGTH}
          />
          <TextField
            rotulo="Endereço *"
            value={address}
            onChangeText={setAddress}
            placeholder="Rua Exemplo, 123"
            maxLength={STORE_FIELD_MAX_LENGTH}
          />
          <TextField
            rotulo="Nome do contato"
            value={contactName}
            onChangeText={setContactName}
            placeholder="Maria Souza"
            maxLength={STORE_FIELD_MAX_LENGTH}
          />
          <TextField
            rotulo="Telefone do contato"
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="(85) 99999-0000"
            keyboardType="phone-pad"
            maxLength={STORE_FIELD_MAX_LENGTH}
          />
          <TextField
            rotulo="E-mail do responsável"
            value={email}
            onChangeText={setEmail}
            placeholder="loja@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={STORE_FIELD_MAX_LENGTH}
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
  erro: { color: colors.danger, marginBottom: spacing.md },
});
