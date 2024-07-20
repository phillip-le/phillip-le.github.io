import { sum, type sumAsync } from './sum';

describe('sum', () => {
  it.fails('should not add up', () => {
    expect(sum(1, 1)).toEqual('2');
  });

  it.fails('should have a type error', () => {
    // @ts-expect-error
    expect(sum(1, 1)).toEqual<number>('2');
  });

  it('should add up two numbers', () => {
    expect(sum(1, 1)).toEqual<ReturnType<typeof sum>>(2);
  });
});

describe('sumAsync', () => {
  it('should add up two numbers', async () => {
    const result = await sum(1, 1);

    expect(result).toEqual<Awaited<ReturnType<typeof sumAsync>>>(2);
  });
});
