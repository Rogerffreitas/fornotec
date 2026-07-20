/**
 * Guarda o token JWT atual fora da árvore React, para que os *RepositoryGatewayApi
 * (instanciados uma única vez em infra/ioc/container.ts, antes de qualquer login)
 * consigam anexar `Authorization: Bearer <token>` nas chamadas autenticadas.
 * AuthContext chama setAuthToken no login/logout.
 */
let currentToken: string | null = null;

export function setAuthToken(token: string | null): void {
  currentToken = token;
}

export function getAuthToken(): string | null {
  return currentToken;
}

export function authHeader(): Record<string, string> {
  return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
}
