/** Interface de criptografia/verificação de senha. Implementação: BcryptEncrypter (bcryptjs). */
export interface Encrypter {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashed: string): Promise<boolean>;
}
