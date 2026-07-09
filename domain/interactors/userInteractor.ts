import { UserUseCase, AuthResult } from '../use-case/userUseCase';
import { UserRepositoryGateway } from '../application/gateway/UserRepositoryGateway';
import { Encrypter } from '../application/infra/Encrypter';
import { TokenGenerator } from '../application/infra/TokenGenerator';
import { AuthenticatedUser, NewUser } from '../entities/User';
import { Role } from '../types';

function toPublicUser(user: {
  id: number;
  name: string;
  username: string;
  role: Role;
}): AuthenticatedUser {
  return { id: user.id, name: user.name, username: user.username, role: user.role };
}

export class UserInteractor implements UserUseCase {
  constructor(
    private readonly gateway: UserRepositoryGateway,
    private readonly encrypter: Encrypter,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async authenticate(
    username: string,
    password: string,
    role: Role,
  ): Promise<AuthResult | undefined> {
    const user = await this.gateway.findByUsername(username);
    if (!user || user.role !== role) return undefined;

    const senhaValida = await this.encrypter.compare(password, user.password);
    if (!senhaValida) return undefined;

    const token = this.tokenGenerator.generate({ sub: user.id, role: user.role });
    return { user: toPublicUser(user), token };
  }

  async register(data: NewUser): Promise<AuthenticatedUser> {
    const hashed = await this.encrypter.hash(data.password);
    const created = await this.gateway.create({ ...data, password: hashed });
    return toPublicUser(created);
  }
}
