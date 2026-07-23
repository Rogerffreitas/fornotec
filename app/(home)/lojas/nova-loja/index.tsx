import React, { useEffect, useRef } from 'react';
import { Text, View, TextInput } from 'react-native';
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

  const descriptionRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const contactNameRef = useRef<TextInput>(null);
  const contactNumberRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
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
        placeholder="Loja Centro"
        maxLength={STORE_FIELD_MAX_LENGTH}
        autoFocus
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => addressRef.current?.focus()}
      />
      <TextField
        ref={addressRef}
        rotulo="Endereço *"
        value={address}
        onChangeText={setAddress}
        placeholder="Rua Exemplo, 123"
        maxLength={STORE_FIELD_MAX_LENGTH}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => contactNameRef.current?.focus()}
      />
      <TextField
        ref={contactNameRef}
        rotulo="Nome do contato"
        value={contactName}
        onChangeText={setContactName}
        placeholder="Maria Souza"
        maxLength={STORE_FIELD_MAX_LENGTH}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => contactNumberRef.current?.focus()}
      />
      <TextField
        ref={contactNumberRef}
        rotulo="Telefone do contato"
        value={contactNumber}
        onChangeText={setContactNumber}
        placeholder="(85) 99999-0000"
        keyboardType="phone-pad"
        maxLength={STORE_FIELD_MAX_LENGTH}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        rotulo="E-mail do responsável"
        value={email}
        onChangeText={setEmail}
        placeholder="loja@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={STORE_FIELD_MAX_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => buttonRef.current?.focus()}
      />
      {erro ? <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{erro}</Text> : null}
      <PrimaryButton ref={buttonRef} titulo="Salvar loja" onPress={salvar} carregando={salvando} />
    </Screen>
  );
}
