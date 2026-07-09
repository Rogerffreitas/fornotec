import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RoleToggle, LoginRole } from '../../components/RoleToggle';
import { colors, spacing } from '../../components/theme';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [role, setRole] = useState<LoginRole>('technician');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleEntrar() {
    const ok = await login(username, password, role);
    if (ok) router.replace('/');
  }

  return (
    <Screen>
      <View style={styles.centro}>
        <Text style={styles.titulo}>Gestão de Fornos</Text>
        <Text style={styles.subtitulo}>Escolha seu perfil e entre com usuário e senha</Text>

        <View style={styles.form}>
          <RoleToggle valor={role} aoMudar={setRole} />

          <TextField
            rotulo="Usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="admin"
          />
          <TextField
            rotulo="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••"
          />

          {error ? <Text style={styles.erro}>{error}</Text> : null}
          <PrimaryButton titulo="Entrar" onPress={handleEntrar} carregando={loading} />

          <Text style={styles.dica}>
            Dados mockados: técnico → admin / admin{'\n'}cliente → cliente / cliente
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitulo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: { paddingHorizontal: spacing.md },
  erro: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  dica: { marginTop: spacing.md, fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
});
