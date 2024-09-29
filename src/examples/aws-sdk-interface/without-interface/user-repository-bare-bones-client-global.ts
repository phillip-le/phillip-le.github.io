import {
  GetCommand,
  type GetCommandInput,
  PutCommand,
  type PutCommandInput,
  paginateScan,
} from '@aws-sdk/lib-dynamodb';
import type { User, UserRepository } from '../types';
import { dynamoDbDocumentClient } from './aws-sdk-v3-bare-bones-client-global';

export const userRepository: UserRepository = {
  createUser: async (user: User) => {
    const input: PutCommandInput = {
      TableName: 'Users',
      Item: user,
    };
    await dynamoDbDocumentClient.send(new PutCommand(input));
  },
  getUserById: async (userId: string) => {
    const input: GetCommandInput = {
      TableName: 'Users',
      Key: {
        userId,
      },
    };
    const response = await dynamoDbDocumentClient.send(new GetCommand(input));

    return response.Item as User;
  },
  getUsers: async () => {
    const paginator = paginateScan(
      { client: dynamoDbDocumentClient },
      { TableName: 'Users' },
    );

    const users: User[] = [];

    for await (const page of paginator) {
      users.push(...(page.Items as User[]));
    }
    return users;
  },
};
