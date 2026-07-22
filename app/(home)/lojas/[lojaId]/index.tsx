import React, { useCallback, useState } from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../../../components/Screen';
import { TextField } from '../../../../components/TextField';
import { PrimaryButton } from '../../../../components/PrimaryButton';
import { EmptyState } from '../../../../components/EmptyState';
import { STORE_FIELD_MAX_LENGTH } from '../../../../domain/entities/Store';
import { storeUseCase } from '../../../../infra/ioc/container';
import { colors, spacing } from '../../../../components/theme';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditarLoja() {
  const { user } = useAuth();
  const { lojaId } = useLocalSearchParams<{ lojaId: string }>();
  const id = Number(lojaId);

  const [carregado, setCarregado] = useState(false);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const loja = await storeUseCase.findById(user!.enterpriseId, id);
    if (!loja) {
      setNaoEncontrada(true);
      setCarregado(true);
      return;
    }
    setDescription(loja.description);
    setAddress(loja.address);
    setContactName(loja.contactName ?? '');
    setContactNumber(loja.contactNumber ?? '');
    setEmail(loja.email ?? '');
    setCarregado(true);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const valido = description.trim() && address.trim();

  async function salvar() {
    if (!valido) {
      setErro('Descrição e endereço são obrigatórios.');
      return;
    }
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      setErro('Informe um e-mail válido.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await storeUseCase.update(user!.enterpriseId, id, {
        description: description.trim(),
        address: address.trim(),
        contactName: contactName.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
        email: email.trim() || undefined,
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

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
