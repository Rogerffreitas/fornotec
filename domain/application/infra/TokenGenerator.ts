/** Interface de geração de token de sessão. Implementação real fica a cargo do back-end. */
export interface TokenGenerator {
  generate(payload: Record<string, unknown>): string;
}
