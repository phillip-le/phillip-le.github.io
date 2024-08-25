import { z } from 'zod';
import type { DynamoClient } from './dynamoClient';

const userSchema = z.object({
  email: z.string(),
});

export type User = z.infer<typeof userSchema>;

export type UserDataAccessService = {
  createUser: (email: string) => Promise<User>;
  getUser: (email: string) => Promise<User>;
};

export const createUserDataAccessService = ({
  tableName,
  dynamoClient,
}: {
  tableName: string;
  dynamoClient: DynamoClient;
}): UserDataAccessService => ({
  createUser: async (email) => {
    await dynamoClient.put({
      TableName: tableName,
      Item: {
        email,
      },
      ConditionExpression: 'attribute_not_exists(email)',
    });

    return {
      email,
    };
  },
  getUser: async (email) => {
    const { Item } = await dynamoClient.get({
      TableName: tableName,
      Key: {
        email,
      },
    });

    return userSchema.parse(Item);
  },
});
