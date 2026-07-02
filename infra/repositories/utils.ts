/** Simula a latência de uma chamada de rede real. */
export function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function nextId<T extends { id: number }>(list: T[]): number {
  return list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;
}
