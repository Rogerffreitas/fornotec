import { UserInteractor } from '../userInteractor';
import { UserRepositoryGateway } from '../../application/gateway/UserRepositoryGateway';
import { Encrypter } from '../../application/infra/Encrypter';
import { HttpError } from '../../application/infra/HttpClient';
import { DecodedToken } from '../../entities/DecodedToken';
import { NewUser } from '../../entities/User';

function buildToken(payload: DecodedToken): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

const VALID_PAYLOAD: DecodedToken = {
  user: {
    id: 'f621024a-a938-4d4e-9517-cf33d9ea6034',
    name: 'Roger Freitas',
    username: 'rogerffreitas',
    email: 'rogerf@outlook.com',
    role: 'TECHNICAL',
    enterpriseId: 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11',
  },
  enterprise: { name: 'CALDAS E FURLANI ENG.' },
  iat: 1783599214,
  exp: 1783685614,
};

function makeGateway(overrides: Partial<UserRepositoryGateway> = {}): jest.Mocked<UserRepositoryGateway> {
  return {
    authenticate: jest.fn(),
    create: jest.fn(),
    ...overrides,
  } as jest.Mocked<UserRepositoryGateway>;
}

function makeEncrypter(): jest.Mocked<Encrypter> {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
}

describe('UserInteractor.authenticate', () => {
  it('decodes the token returned by the gateway into an AuthenticatedUser', async () => {
    const gateway = makeGateway({
      authenticate: jest.fn().mockResolvedValue({ token: buildToken(VALID_PAYLOAD) }),
    });
    const interactor = new UserInteractor(gateway, makeEncrypter());

    const result = await interactor.authenticate('rogerffreitas', 'exemplo', 'TECHNICAL');

    expect(gateway.authenticate).toHaveBeenCalledWith('rogerffreitas', 'exemplo', 'TECHNICAL');
    expect(result).toEqual({
      token: buildToken(VALID_PAYLOAD),
      user: {
        id: 'f621024a-a938-4d4e-9517-cf33d9ea6034',
        name: 'Roger Freitas',
        username: 'rogerffreitas',
        email: 'rogerf@outlook.com',
        role: 'TECHNICAL',
        enterpriseId: 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11',
        enterpriseName: 'CALDAS E FURLANI ENG.',
      },
    });
  });

  it('returns undefined when the gateway rejects with an HttpError (invalid credentials)', async () => {
    const gateway = makeGateway({
      authenticate: jest.fn().mockRejectedValue(new HttpError(401, '/auth/signin')),
    });
    const interactor = new UserInteractor(gateway, makeEncrypter());

    await expect(interactor.authenticate('rogerffreitas', 'wrong', 'TECHNICAL')).resolves.toBeUndefined();
  });

  it('rethrows non-HttpError failures (network/CORS) instead of treating them as invalid credentials', async () => {
    const networkError = new TypeError('Failed to fetch');
    const gateway = makeGateway({
      authenticate: jest.fn().mockRejectedValue(networkError),
    });
    const interactor = new UserInteractor(gateway, makeEncrypter());

    await expect(interactor.authenticate('rogerffreitas', 'exemplo', 'TECHNICAL')).rejects.toBe(
      networkError,
    );
  });
});

describe('UserInteractor.register', () => {
  it('hashes the password before delegating to the gateway', async () => {
    const gateway = makeGateway({ create: jest.fn().mockResolvedValue({ id: 42 }) });
    const encrypter = makeEncrypter();
    encrypter.hash.mockResolvedValue('hashed-password');
    const interactor = new UserInteractor(gateway, encrypter);

    const data: NewUser = {
      name: 'Novo Usuário',
      username: 'novo',
      password: 'plain-text',
      role: 'CLIENT',
      enterpriseId: 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11',
    };

    const result = await interactor.register(data);

    expect(encrypter.hash).toHaveBeenCalledWith('plain-text');
    expect(gateway.create).toHaveBeenCalledWith({ ...data, password: 'hashed-password' });
    expect(result).toEqual({ id: 42 });
  });
});
