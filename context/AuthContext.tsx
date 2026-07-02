import React, { createContext, useContext, useState, useMemo } from "react";
import { AuthenticatedUser } from "../domain/entities/User";
import { Role } from "../domain/types";
import { userUseCase } from "../infra/ioc/container";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string, role: Role) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userUseCase.authenticate(username, password, role);
      if (!result) {
        setError("Usuário, senha ou perfil inválidos.");
        return false;
      }
      setUser(result.user);
      setToken(result.token);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, error, login, logout }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
