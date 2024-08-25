import { Api } from './api';
import { createUser } from './createUser';
import {
  trackUserCreated,
  trackUserCreatedMultipleArgs,
} from './trackUserCreated';

vi.mock('./trackUserCreated');
vi.mock('./api');

const mockApi = vi.mocked(Api).prototype;

describe('createUser', () => {
  beforeEach(() => {
    vi.mocked(mockApi.getHello).mockResolvedValueOnce('hi');
  });

  it.fails('should have a type error', async () => {
    await createUser({ userId: 'user-id', name: 'James', api: mockApi });

    expect(trackUserCreated).toHaveBeenCalledWith({
      invalid: 'error',
    });
  });

  it('should send tracking event', async () => {
    await createUser({ userId: 'user-id', name: 'James', api: mockApi });

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
    const { extra } = await createUser({
      userId: 'user-id',
      name: 'James',
      api: mockApi,
    });

    expect(trackUserCreated).toHaveBeenCalledWith<
      Parameters<typeof trackUserCreated>
    >({
      userId: 'user-id',
      name: 'James',
    });
    expect(trackUserCreatedMultipleArgs).toHaveBeenCalledWith<
      Parameters<typeof trackUserCreatedMultipleArgs>
    >('user-id', 'James');

    expect(extra).toBe('hi');
  });

  it('should send whatever i want', async () => {
    vi.mocked(mockApi.getHello).mockReset().mockResolvedValueOnce('yay');

    const { extra } = await createUser({
      userId: 'user-id',
      name: 'James',
      api: mockApi,
    });

    expect(extra).toBe('yay');
  });
});
