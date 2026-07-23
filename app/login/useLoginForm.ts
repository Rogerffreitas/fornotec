import { useState } from 'react';
import { router } from 'expo-router';
import { LoginRole, LOGIN_ROLE_TO_ROLE } from '../../components/RoleToggle';
import { useAuth } from '@/context/AuthContext';

export interface UseLoginFormResult {
  role: LoginRole;
  setRole: (r: LoginRole) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  error: string | null;
  handleEntrar: () => Promise<void>;
}

/** Autentica (via AuthContext) e navega para a home — a tela (`index.tsx`) só monta a UI. */
export function useLoginForm(): UseLoginFormResult {
  const { login, loading, error } = useAuth();
  const [role, setRole] = useState<LoginRole>('technician');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleEntrar() {
    const ok = await login(username, password, LOGIN_ROLE_TO_ROLE[role]);
    if (ok) router.replace('/');
  }

  return { role, setRole, username, setUsername, password, setPassword, loading, error, handleEntrar };
}
