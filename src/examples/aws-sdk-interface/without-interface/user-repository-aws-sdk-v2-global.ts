import type { DynamoDB } from 'aws-sdk';
import type { User, UserRepository } from '../types';
import { dynamoDbDocumentClient } from './aws-sdk-v2-client-global';

export const userRepository: UserRepository = {
  createUser: async (user) => {
    await dynamoDbDocumentClient
      .put({
        TableName: 'Users',
        Item: user,
      })
      .promise();
  },
  getUserById: async (userId) => {
    const result = await dynamoDbDocumentClient
      .get({
        TableName: 'Users',
        Key: { userId },
      })
      .promise();

    return result.Item as User;
  },
  getUsers: async () => {
    const users: User[] = [];
    let ExclusiveStartKey: DynamoDB.DocumentClient.Key | undefined = undefined;
    do {
      const response = await dynamoDbDocumentClient
        .scan({
          TableName: 'Users',
          ...(ExclusiveStartKey ? { ExclusiveStartKey } : {}),
        })
        .promise();

      users.push(...(response.Items as User[]));

      ExclusiveStartKey = response.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return users;
  },
};
