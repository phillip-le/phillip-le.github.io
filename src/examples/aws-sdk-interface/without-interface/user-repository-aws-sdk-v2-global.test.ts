import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';
import { dynamoDbDocumentClient } from './aws-sdk-v2-client-global';
import { userRepository } from './user-repository-aws-sdk-v2-global';

vi.mock('./aws-sdk-v2-client-global');

describe('userRepository', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a user', async () => {
    const mockPutDynamoDb = vi.fn().mockImplementationOnce(() => ({
      promise: vi.fn().mockResolvedValueOnce({}),
    }));
    vi.spyOn(dynamoDbDocumentClient, 'put').mockImplementation(mockPutDynamoDb);

    await userRepository.createUser({ userId: '1', name: 'Alice' });

    expect(dynamoDbDocumentClient.put).toHaveBeenCalledWith<
      Parameters<typeof dynamoDbDocumentClient.put>
    >({
      TableName: 'Users',
      Item: {
        userId: '1',
        name: 'Alice',
      },
    });
  });

  it('should get a user by ID', async () => {
    const mockGetDynamoDb = vi.fn().mockImplementationOnce(() => ({
      promise: vi
        .fn()
        .mockResolvedValueOnce({ Item: { userId: '1', name: 'Alice' } }),
    }));
    vi.spyOn(dynamoDbDocumentClient, 'get').mockImplementation(mockGetDynamoDb);

    const user = await userRepository.getUserById('1');

    expect(user).toEqual<User>({ userId: '1', name: 'Alice' });
    expect(dynamoDbDocumentClient.get).toHaveBeenCalledWith({
      TableName: 'Users',
      Key: { userId: '1' },
    });
  });

  it('should get all users with pagination', async () => {
    const mockScanDynamoDb = vi
      .fn()
      .mockImplementationOnce(() => ({
        promise: vi.fn().mockResolvedValueOnce({
          Items: [{ userId: '1', name: 'Alice' }],
          LastEvaluatedKey: { userId: '1' },
        }),
      }))
      .mockImplementationOnce(() => ({
        promise: vi.fn().mockResolvedValueOnce({
          Items: [{ userId: '2', name: 'Bob' }],
        }),
      }));
    vi.spyOn(dynamoDbDocumentClient, 'scan').mockImplementation(
      mockScanDynamoDb,
    );

    const users = await userRepository.getUsers();

    expect(users).toEqual<User[]>([
      {
        userId: '1',
        name: 'Alice',
      },
      {
        userId: '2',
        name: 'Bob',
      },
    ]);
    expect(dynamoDbDocumentClient.scan).toHaveBeenCalledWith({
      TableName: 'Users',
      ExclusiveStartKey: {
        userId: '1',
      },
    });
    expect(dynamoDbDocumentClient.scan).toHaveBeenCalledWith({
      TableName: 'Users',
    });
  });
});
