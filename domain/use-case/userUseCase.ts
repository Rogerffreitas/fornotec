import { AuthenticatedUser, NewUser } from '../entities/User';
import { Role } from '../types';

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
}

export interface UserUseCase {
  /** Autentica validando usuário, senha (hash) e papel (technician/client/admin) juntos. */
  authenticate(username: string, password: string, role: Role): Promise<AuthResult | undefined>;
  register(data: NewUser): Promise<AuthenticatedUser>;
}
