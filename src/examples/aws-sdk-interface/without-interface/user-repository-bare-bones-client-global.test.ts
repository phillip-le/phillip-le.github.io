import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  type CustomMatcher,
  toHaveReceivedCommandWith,
  toHaveReceivedNthCommandWith,
} from 'aws-sdk-client-mock-vitest';
import { expect } from 'vitest';
import type { User } from '../types';
import { userRepository } from './user-repository-bare-bones-client-global';

expect.extend({ toHaveReceivedCommandWith, toHaveReceivedNthCommandWith });

import 'vitest';

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: type of Assertion must match vitest
  interface Assertion<T = any> extends CustomMatcher<T> {}
  interface AsymmetricMatchersContaining extends CustomMatcher {}
}

describe('user repository bare bones client globally initialized', () => {
  const mockDynamoDBDocumentClient = mockClient(DynamoDBDocumentClient);

  afterEach(() => {
    mockDynamoDBDocumentClient.reset();
  });

  it('should create a user', async () => {
    mockDynamoDBDocumentClient.on(PutCommand).resolvesOnce({});

    await userRepository.createUser({ userId: '1', name: 'Alice' });

    expect(mockDynamoDBDocumentClient).toHaveReceivedCommandWith(PutCommand, {
      TableName: 'Users',
      Item: { userId: '1', name: 'Alice' },
    });
  });

  it('should get user by id', async () => {
    mockDynamoDBDocumentClient.on(GetCommand).resolvesOnce({
      Item: { userId: '1', name: 'Alice' },
      $metadata: {},
    });

    const user = await userRepository.getUserById('1');

    expect(user).toEqual<User>({ userId: '1', name: 'Alice' });
    expect(mockDynamoDBDocumentClient).toHaveReceivedCommandWith(GetCommand, {
      TableName: 'Users',
      Key: { userId: '1' },
    });
  });

  it('should get all users', async () => {
    mockDynamoDBDocumentClient
      .on(ScanCommand)
      .resolvesOnce({
        Items: [{ userId: '1', name: 'Alice' }],
        LastEvaluatedKey: {
          userId: '1',
        },
      })
      .resolvesOnce({
        Items: [{ userId: '2', name: 'Bob' }],
      });

    const users = await userRepository.getUsers();

    expect(users).toEqual<User[]>([
      { userId: '1', name: 'Alice' },
      { userId: '2', name: 'Bob' },
    ]);
    expect(mockDynamoDBDocumentClient).toHaveReceivedNthCommandWith(
      ScanCommand,
      1,
      {
        TableName: 'Users',
      },
    );
    expect(mockDynamoDBDocumentClient).toHaveReceivedNthCommandWith(
      ScanCommand,
      2,
      {
        TableName: 'Users',
        ExclusiveStartKey: {
          userId: '1',
        },
      },
    );
  });
});
