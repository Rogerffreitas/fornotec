import { NewUser } from '../../entities/User';
import { Role } from '../../types';

export interface UserRepositoryGateway {
  /** Autentica contra a API real; retorna o JWT bruto para o Interactor decodificar. */
  authenticate(username: string, password: string, role: Role): Promise<{ token: string }>;
  create(data: NewUser & { password: string }): Promise<{ id: number }>;
}
