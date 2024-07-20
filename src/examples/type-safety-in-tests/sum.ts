export const sum = (a: number, b: number): number => a + b;

export const sumAsync = (a: number, b: number): Promise<number> =>
  Promise.resolve(a + b);
