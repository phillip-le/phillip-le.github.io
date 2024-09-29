import type { User, UserRepository } from '../types.ts';
import type { IDynamoDBClientV3 } from './types.ts';

export const createUserRepositoryV3 = (
  dynamoDbClient: IDynamoDBClientV3,
): UserRepository => {
  return {
    getUserById: async (userId: string) => {
      const response = await dynamoDbClient.get({
        TableName: 'Users',
        Key: {
          userId,
        },
      });

      return response.Item as User;
    },
    createUser: async (user: User) => {
      await dynamoDbClient.put({
        TableName: 'Users',
        Item: user,
      });
    },
    getUsers: async () => {
      const paginator = dynamoDbClient.paginateScan({
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
};
