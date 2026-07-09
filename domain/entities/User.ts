import { Role } from '../types';

export interface User {
  id: number;
  name: string;
  username: string;
  /** Sempre armazenada como hash (bcryptjs), nunca em texto puro. */
  password: string;
  role: Role;
  enterpriseId: string;
}

export interface NewUser {
  name: string;
  username: string;
  /** Senha em texto puro recebida do formulário; o Interactor faz o hash antes de persistir. */
  password: string;
  role: Role;
  enterpriseId: string;
}

/** Dados do usuário autenticado, extraídos do JWT decodificado no login. */
export interface AuthenticatedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  enterpriseId: string;
  enterpriseName: string;
}
