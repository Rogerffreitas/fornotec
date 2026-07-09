import React, { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { storeUseCase } from '../../../../infra/ioc/container';
import { STORE_FIELD_MAX_LENGTH } from '../../../../domain/entities/Store';
import { colors, spacing } from '../../../../components/theme';

export default function NovaLoja() {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const valido = description.trim() && address.trim();

  async function salvar() {
    if (!valido) {
      setErro('Descrição e endereço são obrigatórios.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await storeUseCase.create({
        description: description.trim(),
        address: address.trim(),
        contactName: contactName.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
      });
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
      {erro ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{erro}</Text> : null}
      <PrimaryButton titulo="Salvar loja" onPress={salvar} carregando={salvando} />
    </Screen>
  );
}
