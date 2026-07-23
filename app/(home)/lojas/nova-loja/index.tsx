import React from 'react';
import { Text } from 'react-native';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { STORE_FIELD_MAX_LENGTH } from '../../../../domain/entities/Store';
import { colors, spacing } from '../../../../components/theme';
import { useNewStore } from './useNewStore';

export default function NovaLoja() {
  const {
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
  } = useNewStore();

  return (
    <Screen>
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
      {erro ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{erro}</Text> : null}
      <PrimaryButton titulo="Salvar loja" onPress={salvar} carregando={salvando} />
    </Screen>
  );
}
