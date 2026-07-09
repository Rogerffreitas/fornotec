import { Role } from '../types';

export interface User {
  id: number;
  name: string;
  username: string;
  /** Sempre armazenada como hash (bcryptjs), nunca em texto puro. */
  password: string;
  role: Role;
}

export interface NewUser {
  name: string;
  username: string;
  /** Senha em texto puro recebida do formulário; o Interactor faz o hash antes de persistir. */
  password: string;
  role: Role;
}

/** Dados públicos do usuário autenticado — nunca inclui a senha/hash. */
export type AuthenticatedUser = Omit<User, 'password'>;
