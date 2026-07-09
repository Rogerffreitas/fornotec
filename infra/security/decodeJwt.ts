/**
 * Decodificação manual do payload de um JWT (base64url -> JSON), sem depender de
 * `atob`/`Buffer` (nem sempre disponíveis no runtime JS do React Native/Hermes,
 * mesmo motivo documentado em SimpleTokenGenerator). Não valida assinatura —
 * a validação/expiração é responsabilidade do back-end.
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(base64: string): string {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  let output = '';
  let buffer = 0;
  let bitsCollected = 0;
  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bitsCollected += 6;
    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      output += String.fromCharCode((buffer >> bitsCollected) & 0xff);
    }
  }
  return output;
}

function base64UrlToBase64(input: string): string {
  return input.replace(/-/g, '+').replace(/_/g, '/');
}

export function decodeJwtPayload<T>(token: string): T {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Token inválido: formato JWT esperado.');
  const raw = decodeBase64(base64UrlToBase64(parts[1]));
  const utf8 = decodeURIComponent(
    raw
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(utf8) as T;
}
