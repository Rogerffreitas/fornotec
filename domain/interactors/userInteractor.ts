import { UserUseCase, AuthResult } from '../use-case/userUseCase';
import { UserRepositoryGateway } from '../application/gateway/UserRepositoryGateway';
import { Encrypter } from '../application/infra/Encrypter';
import { HttpError } from '../application/infra/HttpClient';
import { AuthenticatedUser, NewUser } from '../entities/User';
import { DecodedToken } from '../entities/DecodedToken';
import { Role } from '../types';
import { decodeJwtPayload } from '../../infra/security/decodeJwt';

function toAuthenticatedUser(payload: DecodedToken): AuthenticatedUser {
  return {
    id: payload.user.id,
    name: payload.user.name,
    username: payload.user.username,
    email: payload.user.email,
    role: payload.user.role,
    enterpriseId: payload.user.enterpriseId,
    enterpriseName: payload.enterprise.name,
  };
}

export class UserInteractor implements UserUseCase {
  constructor(
    private readonly gateway: UserRepositoryGateway,
    private readonly encrypter: Encrypter,
  ) {}

  async authenticate(
    username: string,
    password: string,
    role: Role,
  ): Promise<AuthResult | undefined> {
    try {
      const { token } = await this.gateway.authenticate(username, password, role);
      const payload = decodeJwtPayload<DecodedToken>(token);
      if (payload.user.role !== role) return undefined;
      return { user: toAuthenticatedUser(payload), token };
    } catch (error) {
      // HttpError = o servidor respondeu recusando (ex: 401 de credenciais inválidas).
      // Qualquer outro erro (rede/CORS/timeout/token malformado) é repassado para a
      // UI tratar como falha de conexão, não como usuário/senha errados.
      if (error instanceof HttpError) return undefined;
      throw error;
    }
  }

  async register(data: NewUser): Promise<{ id: number }> {
    const hashed = await this.encrypter.hash(data.password);
    return this.gateway.create({ ...data, password: hashed });
  }
}
