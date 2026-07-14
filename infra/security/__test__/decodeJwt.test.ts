import { decodeJwtPayload } from '../decodeJwt';
import { DecodedToken } from '../../../domain/entities/DecodedToken';

// Token real de exemplo (usuário Roger Freitas, role TECHNICAL, empresa "CALDAS E FURLANI ENG.").
const REAL_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZjYyMTAyNGEtYTkzOC00ZDRlLTk1MTctY2YzM2Q5ZWE2MDM0IiwibmFtZSI6IlJvZ2VyIEZyZWl0YXMiLCJ1c2VybmFtZSI6InJvZ2VyZmZyZWl0YXMiLCJlbWFpbCI6InJvZ2VyZkBvdXRsb29rLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEyJHM5WGh6RFdieC9OSWVQendHdUt5eC5BaVFKZUguNXFrdllkcW03bzdKTmJ2UFJQeWtyVkFHIiwicm9sZSI6IlRFQ0hOSUNBTCIsImVudGVycHJpc2VJZCI6ImVkNDc2NGNjLWY1ZmItNDZlYS1hNjQwLWQwZDdhOThkMGUxMSIsInByb2ZpbGVQaWMiOiJkZWZhdWx0LnBuZyIsInNlcnZlcklkIjoxLCJpc1ZhbGlkIjp0cnVlLCJpc0Nvbm5lY3RlZCI6ZmFsc2UsImNyZWF0ZWRBdCI6MTc3MzA5OTAzMjAwMCwidXBkYXRlZEF0IjoxNzczMDk5MDMyMDAwfSwiZW50ZXJwcmlzZSI6eyJuYW1lIjoiQ0FMREFTIEUgRlVSTEFOSSBFTkcuIn0sImlhdCI6MTc4MzU5OTIxNCwiZXhwIjoxNzgzNjg1NjE0fQ.iEqcFgcSCx7MbYABvq9tE21D354GWaTUkQNL9SnapEc';

describe('decodeJwtPayload', () => {
  it('decodes the user, enterprise and claims from a real token', () => {
    const payload = decodeJwtPayload<DecodedToken>(REAL_TOKEN);

    expect(payload.user).toMatchObject({
      id: 'f621024a-a938-4d4e-9517-cf33d9ea6034',
      name: 'Roger Freitas',
      username: 'rogerffreitas',
      email: 'rogerf@outlook.com',
      role: 'TECHNICAL',
      enterpriseId: 'ed4764cc-f5fb-46ea-a640-d0d7a98d0e11',
    });
    expect(payload.enterprise).toEqual({ name: 'CALDAS E FURLANI ENG.' });
    expect(payload.iat).toBe(1783599214);
    expect(payload.exp).toBe(1783685614);
  });

  it('decodes accented characters correctly (UTF-8 payload)', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ name: 'João Ção' })).toString('base64url');
    const token = `${header}.${payload}.signature`;

    expect(decodeJwtPayload<{ name: string }>(token)).toEqual({ name: 'João Ção' });
  });

  it('throws for a token without a payload segment', () => {
    expect(() => decodeJwtPayload('not-a-jwt')).toThrow('Token inválido');
  });
});
