import { UserRepositoryGateway } from '../../domain/application/gateway/UserRepositoryGateway';
import { NewUser } from '../../domain/entities/User';
import { Role } from '../../domain/types';
import { HttpClient } from '../../domain/application/infra/HttpClient';

interface SignInResponse {
  accessToken: {
    token: string;
    type: string;
  };
}

export class UserRepositoryGatewayApi implements UserRepositoryGateway {
  constructor(private readonly http: HttpClient) {}

  async authenticate(username: string, password: string, role: Role): Promise<{ token: string }> {
    const response = await this.http.post<SignInResponse>('/auth/signin', {
      username,
      password,
      role,
    });
    return { token: response.accessToken.token };
  }

  /** Endpoint ainda não confirmado com o back-end; ajustar quando o contrato existir. */
  async create(data: NewUser & { password: string }): Promise<{ id: number }> {
    return this.http.post<{ id: number }>('/users', data);
  }
}
