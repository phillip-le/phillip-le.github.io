import type { DynamoDB } from 'aws-sdk';
import type { User, UserRepository } from '../types.ts';
import { dynamoDBClient } from './aws-sdk-v2-client-global.ts';

export const userRepository: UserRepository = {
  createUser: async (user) => {
    await dynamoDBClient.put({
      TableName: 'Users',
      Item: user,
    });
  },
  getUserById: async (userId) => {
    const response = await dynamoDBClient.get({
      TableName: 'Users',
      Key: {
        userId,
      },
    });
    return response.Item as User;
  },
  getUsers: async () => {
    const users: User[] = [];
    let ExclusiveStartKey: DynamoDB.DocumentClient.Key | undefined = undefined;
    do {
      const response = await dynamoDBClient.scan({
        TableName: 'Users',
        ...(ExclusiveStartKey && { ExclusiveStartKey }),
      });

      users.push(...(response.Items as User[]));

      ExclusiveStartKey = response.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return users;
  },
};
