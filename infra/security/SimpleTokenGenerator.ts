import { TokenGenerator } from '../../domain/application/infra/TokenGenerator';

/**
 * Gerador de token mockado — apenas para o app funcionar de ponta a ponta
 * antes do back-end existir. NÃO é um JWT assinado e não deve ser usado em
 * produção; a geração de token real deve acontecer no servidor.
 *
 * Evita `Buffer`/`btoa` de propósito: nem sempre disponíveis no runtime JS
 * do React Native (Hermes) ou em todos os alvos do Expo web.
 */
export class SimpleTokenGenerator implements TokenGenerator {
  generate(payload: Record<string, unknown>): string {
    const random = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const summary = Object.entries(payload)
      .map(([key, value]) => `${key}:${String(value)}`)
      .join('|');
    return `mock.${random}.${summary}`;
  }
}
