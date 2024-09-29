import type {
  GetCommandInput,
  Paginator,
  PutCommandInput,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { afterEach } from 'vitest';
import type { User } from '../types.ts';
import type { IDynamoDBClientV3 } from './types.ts';
import { createUserRepositoryV3 } from './user-repository-bare-bones-injected.ts';

describe('AWS SDK v3', () => {
  const dynamoDBClient: IDynamoDBClientV3 = {
    put: vi.fn(),
    get: vi.fn(),
    paginateScan: vi.fn(),
  };

  const userRepository = createUserRepositoryV3(dynamoDBClient);

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a user', async () => {
    vi.mocked(dynamoDBClient.put).mockResolvedValueOnce({
      $metadata: {},
    });

    await userRepository.createUser({ userId: '1', name: 'Alice' });

    expect(dynamoDBClient.put).toHaveBeenCalledWith<[PutCommandInput]>({
      TableName: 'Users',
      Item: { userId: '1', name: 'Alice' },
    });
  });

  it('should get user by id', async () => {
    vi.mocked(dynamoDBClient.get).mockResolvedValueOnce({
      Item: { userId: '1', name: 'Alice' },
      $metadata: {},
    });

    const user = await userRepository.getUserById('1');

    expect(user).toEqual<User>({ userId: '1', name: 'Alice' });
    expect(dynamoDBClient.get).toHaveBeenCalledWith<[GetCommandInput]>({
      TableName: 'Users',
      Key: { userId: '1' },
    });
  });

  it('should get all users', async () => {
    async function* generator(): Paginator<QueryCommandOutput> {
      yield {
        Items: [{ userId: '1', name: 'Alice' }],
        $metadata: {},
      };
      yield {
        Items: [{ userId: '2', name: 'Bob' }],
        $metadata: {},
      };
    }
    vi.mocked(dynamoDBClient.paginateScan).mockImplementation(generator);

    const users = await userRepository.getUsers();

    expect(users).toEqual<User[]>([
      { userId: '1', name: 'Alice' },
      { userId: '2', name: 'Bob' },
    ]);
    expect(dynamoDBClient.paginateScan).toHaveBeenCalledWith<
      Parameters<typeof dynamoDBClient.paginateScan>
    >({
      input: { TableName: 'Users' },
      paginationOptions: { pageSize: 10 },
    });
  });
});
