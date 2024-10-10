import { sign } from 'node:crypto';
import { expect } from 'vitest';
import { signMe } from './signSignature';

vi.mock('node:crypto');

describe('signMe', () => {
  it('should type', () => {
    vi.mocked(sign as () => Buffer).mockReturnValueOnce(Buffer.from('hello'));

    const result = signMe();

    expect(result.toString()).toBe('hello');

    expect(sign).toHaveBeenCalledWith(null, Buffer.from('hi'), '');
  });
});
