import { createUser } from './createUser';
import {
  trackUserCreated,
  trackUserCreatedMultipleArgs,
} from './trackUserCreated';

vi.mock('./trackUserCreated');

describe('createUser', () => {
  it.fails('should have a type error', async () => {
    await createUser({ userId: 'user-id', name: 'James' });

    expect(trackUserCreated).toHaveBeenCalledWith({
      invalid: 'error',
    });
  });

  it('should send tracking event', async () => {
    await createUser({ userId: 'user-id', name: 'James' });

    expect(trackUserCreated).toHaveBeenCalledWith<
      [
        {
          userId: string;
          name: string;
        },
      ]
    >({
      userId: 'user-id',
      name: 'James',
    });
    expect(trackUserCreatedMultipleArgs).toHaveBeenCalledWith<[string, string]>(
      'user-id',
      'James',
    );
  });

  it('should send tracking event with generated type', async () => {
    await createUser({ userId: 'user-id', name: 'James' });

    expect(trackUserCreated).toHaveBeenCalledWith<
      Parameters<typeof trackUserCreated>
    >({
      userId: 'user-id',
      name: 'James',
    });
    expect(trackUserCreatedMultipleArgs).toHaveBeenCalledWith<
      Parameters<typeof trackUserCreatedMultipleArgs>
    >('user-id', 'James');
  });
});
