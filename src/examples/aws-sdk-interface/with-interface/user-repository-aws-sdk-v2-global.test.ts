import type { DynamoDB } from 'aws-sdk';
import { afterEach } from 'vitest';
import type { User } from '../types.ts';
import { dynamoDBClient } from './aws-sdk-v2-client-global.ts';
import { userRepository } from './user-repository-aws-sdk-v2-global.ts';

vi.mock('./aws-sdk-v2-client-global.ts');

describe('AWS SDK v2', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a user', async () => {
    vi.mocked(dynamoDBClient.put).mockResolvedValueOnce({});

    await userRepository.createUser({ userId: '1', name: 'Alice' });

    expect(dynamoDBClient.put).toHaveBeenCalledWith<
      [DynamoDB.DocumentClient.PutItemInput]
    >({
      TableName: 'Users',
      Item: { userId: '1', name: 'Alice' },
    });
  });

  it('should get user by id', async () => {
    vi.mocked(dynamoDBClient.get).mockResolvedValueOnce({
      Item: { userId: '1', name: 'Alice' },
    });

    const user = await userRepository.getUserById('1');

    expect(user).toEqual<User>({ userId: '1', name: 'Alice' });
    expect(dynamoDBClient.get).toHaveBeenCalledWith<
      [DynamoDB.DocumentClient.GetItemInput]
    >({
      TableName: 'Users',
      Key: { userId: '1' },
    });
  });

  it('should get all users', async () => {
    vi.mocked(dynamoDBClient.scan)
      .mockResolvedValueOnce({
        Items: [{ userId: '1', name: 'Alice' }],
        LastEvaluatedKey: { userId: '1' },
      })
      .mockResolvedValueOnce({
        Items: [{ userId: '2', name: 'Bob' }],
      });

    const users = await userRepository.getUsers();

    expect(users).toEqual<User[]>([
      { userId: '1', name: 'Alice' },
      { userId: '2', name: 'Bob' },
    ]);
    expect(dynamoDBClient.scan).toHaveBeenCalledWith<
      Parameters<typeof dynamoDBClient.scan>
    >({
      TableName: 'Users',
    });
  });
});
