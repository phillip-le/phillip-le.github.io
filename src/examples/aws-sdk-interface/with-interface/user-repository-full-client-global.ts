import type { User, UserRepository } from '../types.ts';
import { dynamoDBClient } from './aws-sdk-v3-full-client-global.ts';

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
    const paginator = dynamoDBClient.paginateScan({
      input: {
        TableName: 'Users',
      },
      paginationOptions: {
        pageSize: 10,
      },
    });

    const users: User[] = [];
    for await (const response of paginator) {
      users.push(...(response.Items as User[]));
    }

    return users;
  },
};
