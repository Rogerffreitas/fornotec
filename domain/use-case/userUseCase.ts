import { NewUser, AuthenticatedUser } from '../entities/User';
import { Role } from '../types';

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
}

export interface UserUseCase {
  /** Autentica contra a API real (username, senha e papel) e decodifica o JWT retornado. */
  authenticate(username: string, password: string, role: Role): Promise<AuthResult | undefined>;
  register(data: NewUser): Promise<{ id: number }>;
}
