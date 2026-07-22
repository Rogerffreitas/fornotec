import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RoleToggle, LoginRole, LOGIN_ROLE_TO_ROLE } from '../../components/RoleToggle';
import { colors, spacing, radius } from '../../components/theme';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [role, setRole] = useState<LoginRole>('technician');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleEntrar() {
    const ok = await login(username, password, LOGIN_ROLE_TO_ROLE[role]);
    if (ok) router.replace('/');
  }

  return (
    <Screen>
      <View style={styles.centro}>
        <View style={styles.marca}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>Fornotec</Text>
        </View>

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
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center' },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  logo: { width: 26, height: 37 },
  wordmark: { fontSize: 24, fontWeight: '800', color: colors.primary },
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
});
